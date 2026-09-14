// كل قسم في الموقع (هوم/لوجين/عروض/لوحة السينما) بقى بيستخدم نفس نسخة الـ axios
// وعنوان الباك اند من ملف .env واحد - الملف ده موجود بس عشان باقي ملفات theater/api/*
// اللي بتستورد من './client' تفضل شغالة من غير ما نعدل كل واحد فيهم.
export { default, API_BASE_URL, unwrap, getErrorMessage, clearSession } from '../../../lib/api';
