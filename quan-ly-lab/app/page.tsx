'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const [kits, setKits] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // Biến lưu từ khóa tìm kiếm
  const router = useRouter();

  // Tải danh sách Kit
  const fetchKits = async () => {
    const { data } = await supabase.from('equipment').select('*').order('id');
    setKits(data || []);
  };

  useEffect(() => { fetchKits(); }, []);

  // Hàm Xóa Kit
  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ CẢNH BÁO: Bạn có chắc muốn xóa Kit này khỏi kho không?')) return;
    
    const { error } = await supabase.from('equipment').delete().eq('id', id);
    if (error) alert('Lỗi: ' + error.message);
    else fetchKits(); 
  };

  // Chuyển sang trang Edit
  const handleQuickAdd = async () => {
    const name = prompt("Nhập tên Kit mới:");
    if (!name) return;
    
    const { data, error } = await supabase
      .from('equipment')
      .insert([{ 
        name, 
        total_qty: 0, 
        available_qty: 0,
        image_url: '' 
      }])
      .select()
      .single();

    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      router.push(`/kit/${data.id}/edit`);
    }
  };

  // 🔍 Logic lọc danh sách theo tên
  const filteredKits = kits.filter(kit => 
    kit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-20">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b shadow-sm p-4 -mx-4 md:mx-0 md:rounded-b-2xl mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-blue-800 tracking-tight">📦 STORAGE</h1>
          <Link href="/kit/create" className="bg-black text-white px-5 py-2 rounded-full font-bold hover:bg-gray-800 transition shadow-lg active:scale-95">
          + Thêm Kit
          </Link>
        </div>

        {/* Thanh Tìm Kiếm */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input 
            type="text"
            placeholder="Tìm kiếm kit theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 border-2 rounded-xl outline-none transition-all font-medium"
          />
        </div>
      </div>

      {/* --- DANH SÁCH KIT --- */}
      <div className="grid gap-6">
        {filteredKits.length === 0 ? (
          <div className="text-center text-gray-400 py-10 italic">
            Không tìm thấy thiết bị nào...
          </div>
        ) : (
          filteredKits.map((kit) => (
            <div key={kit.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow duration-300">
              
              <div className="flex gap-4">
                {/* Ảnh thumbnail */}
                <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0 border relative group">
                  {kit.image_url ? (
                    <img src={kit.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">NO IMG</div>
                  )}
                  {/* Badge ID */}
                  <span className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur">
                    #{kit.id}
                  </span>
                </div>

                {/* Nội dung chính */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-gray-900 leading-tight">{kit.name}</h3>
                    
                    {/* Nút Xóa nhỏ gọn */}
                    <button 
                        onClick={() => handleDelete(kit.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                        title="Xóa kit này"
                    >
                        🗑️
                    </button>
                  </div>

                  {/* Thông số kho */}
                  <div className="mt-2 text-sm text-gray-600">
                     <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-500 mr-2">KHO: {kit.total_qty}</span>
                     <span className={`px-2 py-1 rounded text-xs font-bold ${kit.available_qty > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        CÒN: {kit.available_qty}
                     </span>
                  </div>

                  <div className="flex gap-3 mt-auto pt-4">
                    <Link href={`/kit/${kit.id}/edit`} className="flex-1 text-center py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition text-sm flex items-center justify-center gap-1">
                      Chi tiết
                    </Link>

                    <Link href={`/kit/${kit.id}`} className="flex-1 text-center py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-1">
                      Mượn 
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}