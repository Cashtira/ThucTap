import { supabase } from '@/lib/supabaseClient';

// Hàm lấy dữ liệu từ Supabase
async function getEquipments() {
  // Chọn tất cả cột từ bảng 'equipment'
  const { data, error } = await supabase.from('equipment').select('*');
  
  if (error) {
    console.error('Lỗi lấy dữ liệu:', error);
    return [];
  }
  return data;
}

// Đây là trang chủ (Home Page)
export default async function Home() {
  const equipments = await getEquipments();

  return (
    <main className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">
        Quản lý phòng Lab - Danh sách thiết bị
      </h1>

      <div className="grid gap-4">
        {equipments?.map((item: any) => (
          <div key={item.id} className="border p-4 rounded shadow-md bg-white">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className={`mt-2 ${item.status === 'ready' ? 'text-green-600' : 'text-red-600'}`}>
              Trạng thái: {item.status}
            </p>
          </div>
        ))}

        {equipments?.length === 0 && (
          <p>Chưa có thiết bị nào trong kho.</p>
        )}
      </div>
    </main>
  );
}