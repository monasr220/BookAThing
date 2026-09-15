export default function CustomerInfo({ name, setName, phone, setPhone }) {
  return (
    <>
      <p className="label">بياناتك</p>
      <input className="input-field" placeholder="اسمك" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input-field" placeholder="رقم الموبايل 11 رقم" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 11))} />
    </>
  );
}
