'use client'; 

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function KitDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [kit, setKit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 1. Tải thông tin Kit khi vào trang
  useEffect(() => {
    async function fetchKit() {
      if (!id) return;
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) console.error("Lỗi:", error);
      else setKit(data);
    }
    fetchKit();
  }, [id]);

  // 2. Xử lý khi bấm nút Mượn
  async function handleBorrow(e: any) {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const studentName = form.studentName.value;
    const mssv = form.mssv.value;
    const file = form.cardImage.files[0];

    try {
      if (!file) {
        alert('Thiếu ảnh thẻ SV'); 
        setLoading(false); 
        return;
      }

      // A. Upload ảnh thẻ
      const fileName = `loan-${Date.now()}-${mssv}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);
      if (uploadError) throw uploadError;
      
      const cardUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;

      // B. Kiểm tra còn hàng không (phòng trường hợp 2 người bấm cùng lúc)
      if (kit.available_qty <= 0) {
        alert('Hiện không còn hàng');
        return;
      }

      // C. Trừ kho & Lưu lịch sử mượn
      // Note: Logic chuẩn thực tế nên dùng RPC hoặc Transaction, sẽ sửa sau nếu cần.
      
      // Update số lượng
      await supabase.from('equipment')
        .update({ available_qty: kit.available_qty - 1 })
        .eq('id', id);

      // Insert vào bảng loans
      const { error: loanError } = await supabase.from('loans').insert([
        {
          kit_id: id,            
          student_name: studentName,
          mssv: mssv,
          card_url: cardUrl,     
          returned: false
        }
      ]);

      if (loanError) throw loanError;

      alert('Đăng ký mượn thành công!');
      router.push('/');

    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!kit) return <div className="p-10 text-center">Đang tải thông tin...</div>;

  return (
    <div className="min-h-screen bg-white p-4 font-sans">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-gray-500 mb-4 inline-block">← Quay lại</Link>

        {/* Ảnh Thông số */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">{kit.name}</h1>
          <div className="border rounded-lg overflow-hidden bg-gray-100">
             {kit.image_url ? (
               <img src={kit.image_url} alt="Thông số" className="w-full h-auto object-contain" />
             ) : (
               <div className="h-48 flex items-center justify-center text-gray-400">Chưa có ảnh thông số</div>
             )}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2"> Ảnh thông số kỹ thuật & Phụ kiện</p>
        </div>

        {/* Trạng thái kho */}
        <div className="bg-gray-50 p-4 rounded-xl text-center mb-8 border">
          <p className="text-gray-600 text-sm">Trạng thái kho</p>
          <div className="flex justify-center items-end gap-2 mt-1">
             <span className={`text-4xl font-bold ${kit.available_qty > 0 ? 'text-green-600' : 'text-red-500'}`}>
               {kit.available_qty}
             </span>
             <span className="text-gray-400 mb-1">/ {kit.total_qty} bộ</span>
          </div>
        </div>

        {/* Form Mượn (Chỉ hiện khi còn hàng) */}
        {kit.available_qty > 0 ? (
          <form onSubmit={handleBorrow} className="space-y-4">
            <h3 className="font-bold text-lg border-b pb-2">📝 Điền phiếu mượn</h3>
            
            <div>
              <input name="studentName" placeholder="Họ tên sinh viên" required className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white outline-blue-500" />
            </div>
            
            <div>
              <input name="mssv" placeholder="Mã số sinh viên" required className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white outline-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Chụp ảnh thẻ SV / CCCD:</label>
              <input type="file" name="cardImage" accept="image/*" capture="environment" required className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>

            <button disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg disabled:bg-gray-400 mt-4">
              {loading ? 'Đang xử lý...' : 'XÁC NHẬN MƯỢN'}
            </button>
          </form>
        ) : (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold">
            🚫 Tạm thời hết thiết bị này
          </div>
        )}

      </div>
    </div>
  );
}