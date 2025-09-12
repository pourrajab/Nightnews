export enum BadRequestMessage {
  InValidLoginData = "اطلاعات ارسال شده برای ورود صحیح نمیباشد",
  InValidRegisterData = "اطلاعات ارسال شده برای ثبت نام صحیح نمیباشد",
  SomeThingWrong = "خطایی پیش آمده مجددا تلاش کنید",
  InvalidCategories = "دسته بندی ها را به درستی وارد کنید",
  AlreadyAccepted = "نظر انتخاب شده قبلا تایید شده است",
  AlreadyRejected = "نظر انتخاب شده قبلا رد شده است",
}
export enum AuthMessage {
  NotFoundAccount = "حساب کاربری یافت نشد",
  TryAgain = "دوباره تلاش کنید",
  AlreadyExistAccount = "حساب کاربری با این مشخصات قبلا وجود دارد",
  ExpiredCode = "کد تایید منقصی شده مجددا تلاش کنید.",
  LoginAgain = "مجددا وارد حساب کاربری خود شوید",
  LoginIsRequired = "وارد حساب کاربری خود شوید",
  Blocked = "حساب کاربری شما مسدود میباشد، لطفا با پشتیبانی در ارتباط باشد",
  PasswordTooShort = "رمز عبور باید حداقل 8 کاراکتر باشد",
}
export enum NotFoundMessage {
  NotFound = "موردی یافت نشد",
  NotFoundCategory = "دسته بندی یافت نشد",
  NotFoundPost = "مقاله ای یافت نشد",
  NotFoundUser = "کاربری یافت نشد",
}
export enum ValidationMessage {
  InvalidImageFormat = "فرمت تصریر انتخاب شده باید ار نوع jpg و png باشد",
  InvalidEmailFormat = "ایمیل وارد شده صحیح نمیباشد",
  InvalidPhoneFormat = "شماره موبایل وارد شده صحیح نمیباشد",
  PasswordTooShort = "رمز عبور باید حداقل 8 کاراکتر باشد",
  Required = "پر کردن این فیلد الزامی است",
  TooShort = "طول این فیلد کوتاه است",
  TooLong = "طول این فیلد بلند است",
  LengthOutOfRange = "مقدار وارد شده باید بین 3 تا 100 کارکتر باشد",
  LengthOutOfRangeNewsTitle = "مقدار وارد شده باید بین 10 تا 150 کارکتر باشد",
  LengthOutOfRangeNewsConetnt = "مقدار وارد شده باید حداقل  10 کارکتر باشد",
  LengthOutOfRangeComment = "مقدار وارد شده باید بین 1 تا 500 کارکتر باشد",

  InvalidEnum = "مقدار وارد شده نامعتبر است",
  InvalidSlug = "ساختار اسلاگ نامعتبر است",
  InvalidUUID = "شناسه وارد شده معتبر نیست",
  MustBeNumber = "این فیلد باید عدد باشد",
  MustBeString = "این فیلد باید متن باشد",
  MustBeBoolean = "این فیلد باید مقدار درست/نادرست باشد",
  InvalidDate = "فرمت تاریخ نامعتبر است",
  InvalidURL = "آدرس وارد شده معتبر نیست",
}
export enum PublicMessage {
  SentOtp = "کد یکبار مصرف با موفقیت ارسال شد",
  LoggedIn = "با موفقیت وارد حساب کاربری خود شدید",
  Created = "با موفقیت ایجاد شد",
  Deleted = "با موفقیت حذف شد",
  Updated = "با موفقیت به روز رسانی شد",
  Inserted = "با موفقیت درج شد",
  Like = "مقاله با موفقیت لایک شد",
  DisLike = "لایک شما از مقاله برداشته شد",
  Bookmark = "مقاله با موفقیت ذخیره شد",
  UnBookmark = " مقاله از لیست مقالات ذخیره شده برداشته شد",
  CreatedComment = " نظر شما با موفقیت ثبت شد",
  CommentAccepted = "کامنت با موفقیت تایید شد",
  CommentRejected = "کامنت با موفقیت رد شد",
  Blocked = "حساب کاربری با موفقیت مسدود شد",
  UnBlocked = "حساب کاربری از حالت مسدود خارج شد",
}
export enum ConflictMessage {
  CategoryTitle = "عنوان دسته بندی قبلا ثبت شده است",
  Email = "ایمیل توسط شخص دیگری استفاده شده",
  Phone = "موبایل توسط شخص دیگری استفاده شده",
  Username = "تام کاربری توسط شخص دیگری استفاده شده",
}
