import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common";
import { ProfileDto } from "./dto/profile.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "./entities/profile.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { Gender } from "./enum/gender.enum";
import { ProfileImages } from "./types/files";
import {
  AuthMessage,
  BadRequestMessage,
  ConflictMessage,
  NotFoundMessage,
  PublicMessage,
} from "src/common/enums/message.enum";
import { OtpEntity } from "./entities/otp.entity";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/tokens.service";
import { CookieKeys } from "src/common/enums/cookie.enum";
import { AuthMethod } from "../auth/enums/method.enum";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { paginationGenerator, paginationSolver } from "src/common/utils/pagination.util";
import { UserBlockDto } from "../auth/dto/auth.dto";
import { UserStatus } from "./enum/status.enum";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto, UpdateUserRoleDto } from "./dto/password.dto";
import { Roles } from "src/common/enums/role.enum";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService
  ) {}
  async changeProfile(files: ProfileImages, profileDto: ProfileDto) {
    if (files?.image_profile?.length > 0) {
      let [image] = files?.image_profile;
      profileDto.image_profile = image?.path?.slice(7);
    }
    if (files?.bg_image?.length > 0) {
      let [image] = files?.bg_image;
      profileDto.bg_image = image?.path?.slice(7);
    }
    const { id: userId, profileId } = this.request.user;

    let profile = await this.profileRepository.findOneBy({ userId });
    const { bio, birthday, gender, linkedin_profile, nick_name, x_profile, image_profile, bg_image } =
      profileDto;

    const hasValidBirthday = birthday && !isNaN(Date.parse(birthday as unknown as string));

    if (profile) {
      if (nick_name) profile.nick_name = nick_name;
      if (bio) profile.bio = bio;
      if (hasValidBirthday) profile.birthday = new Date(birthday);
      if (gender && Object.values(Gender).includes(gender as Gender)) profile.gender = gender;
      if (linkedin_profile) profile.linkedin_profile = linkedin_profile;
      if (x_profile) profile.x_profile = x_profile;
      if (image_profile) profile.image_profile = image_profile;
      if (bg_image) profile.bg_image = bg_image;
    } else {
      const safeNickName = nick_name ?? this.request.user?.username ?? "";
      profile = this.profileRepository.create({
        nick_name: safeNickName,
        bio,
        birthday: hasValidBirthday ? new Date(birthday) : undefined,
        gender,
        linkedin_profile,
        x_profile,
        userId,
        image_profile,
        bg_image,
      });
    }
    profile = await this.profileRepository.save(profile);
    if (!profileId) {
      await this.userRepository.update({ id: userId }, { profileId: profile.id });
    }
    return {
      message: PublicMessage.Updated,
    };
  }
  async find(paginationDto: PaginationDto) {
    const { limit, page, skip } = paginationSolver(paginationDto);
    const [users, count] = await this.userRepository.findAndCount({
      where: {},
      skip,
      take: limit,
    });
    return {
      pagination: paginationGenerator(count, page, limit),
      users,
    };
  }

  async profile() {
    const { id } = this.request.user;
    if (!id) {
      throw new UnauthorizedException(AuthMessage.LoginIsRequired);
    }
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["profile"],
    });
    return user;
  }
  async changeEmail(email: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ email });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Email);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { new_email: email });
    const otp = await this.authService.saveOtp(id, AuthMethod.Email);
    const token = this.tokenService.createEmailToken({ email });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyEmail(code: string) {
    const { id: userId, new_email } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.EmailOTP];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== new_email) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Email) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    await this.userRepository.update(
      { id: userId },
      {
        email,
        verify_email: true,
        new_email: null,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }
  async changePhone(phone: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ phone });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Phone);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { new_phone: phone });
    const otp = await this.authService.saveOtp(id, AuthMethod.Phone);
    const token = this.tokenService.createPhoneToken({ phone });
    return {
      code: otp.code,
      token,
    };
  }
  async verifyPhone(code: string) {
    const { id: userId, new_phone } = this.request.user;
    const token = this.request.cookies?.[CookieKeys.PhoneOTP];
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);
    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== new_phone) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    const otp = await this.checkOtp(userId, code);
    if (otp.method !== AuthMethod.Phone) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    await this.userRepository.update(
      { id: userId },
      {
        phone,
        verify_phone: true,
        new_phone: null,
      }
    );
    return {
      message: PublicMessage.Updated,
    };
  }
  async changeUsername(username: string) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ username });
    if (user && user?.id !== id) {
      throw new ConflictException(ConflictMessage.Username);
    } else if (user && user.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }
    await this.userRepository.update({ id }, { username });
    return {
      message: PublicMessage.Updated,
    };
  }
  async changePassword(body: ChangePasswordDto) {
    const { id } = this.request.user;
    const user = await this.userRepository.findOneBy({ id });
    if (!user || !user.password) throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    const ok = await bcrypt.compare(body.currentPassword, user.password);
    if (!ok) throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    const hash = await bcrypt.hash(body.newPassword, 12);
    await this.userRepository.update({ id }, { password: hash });
    return { message: PublicMessage.Updated };
  }

  async updateUserRole(body: UpdateUserRoleDto) {
    const { userId, role } = body;
    if (!Object.values(Roles).includes(role as Roles)) {
      throw new BadRequestException(BadRequestMessage.SomeThingWrong);
    }
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    await this.userRepository.update({ id: userId }, { role });
    return { message: PublicMessage.Updated };
  }
  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new BadRequestException(NotFoundMessage.NotFound);
    const now = new Date();
    if (otp.expiresIn < now) throw new BadRequestException(AuthMessage.ExpiredCode);
    if (otp.code !== code) throw new BadRequestException(AuthMessage.TryAgain);
    return otp;
  }

  async blockToggle(blockDto: UserBlockDto) {
    const { userId } = blockDto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.NotFoundUser);
    let message = PublicMessage.Blocked;
    if (user.status === UserStatus.Block) {
      message = PublicMessage.UnBlocked;
      await this.userRepository.update({ id: userId }, { status: null });
    } else {
      await this.userRepository.update({ id: userId }, { status: UserStatus.Block });
    }
    return {
      message,
    };
  }
}
