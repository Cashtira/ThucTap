'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateKitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form dữ liệu khởi tạo rỗng
  const [formData, setFormData] = useState({
    name: '',
    total_qty: 1, // Mặc định là 1 cho đỡ phải gõ
    available_qty: 1,
    image_url: ''
  });

  // Xử lý nhập liệu
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý Upload ảnh
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      // Đặt tên file tạm thời bằng timestamp
      const fileName = `new-kit-${Date.now()}`; 
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      
      if (error) throw error;

      const publicUrl = supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl;
      setFormData(prev => ({ ...prev, image_url: publicUrl }));

    } catch (error: any) {
      alert('Lỗi upload ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Lưu vào Database (INSERT)
  const handleSave = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra dữ liệu cơ bản
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên thiết bị!");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('equipment')
      .insert([{
        name: formData.name,
        total_qty: parseInt(formData.total_qty.toString()),
        available_qty: parseInt(formData.available_qty.toString()),
        image_url: formData.image_url
      }]);

    setLoading(false);

    if (error) {
      alert('Lỗi lưu: ' + error.message);
    } else {
      alert('✅ Đã thêm thiết bị mới thành công!');
      router.push('/'); // Quay về trang chủ
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800"> Thêm Thiết Bị Mới</h1>
        <Link href="/" className="text-gray-500 hover:text-black font-medium">❌ Hủy bỏ</Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6 border p-6 rounded-xl shadow-sm bg-gray-50">
        
        {/* Tên Kit */}
        <div>
          <label className="block font-bold mb-1 text-gray-700">Tên thiết bị:</label>
          <input 
            type="text" name="name" placeholder="VD: Kit FPGA DE10-Nano"
            value={formData.name} onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
          />
        </div>

        {/* Số lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold mb-1 text-gray-700">Tổng nhập về:</label>
            <input 
              type="number" name="total_qty" min="0"
              value={formData.total_qty} onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-gray-700">Hiện có sẵn:</label>
            <input 
              type="number" name="available_qty" min="0"
              value={formData.available_qty} onChange={handleChange}
              className="w-full p-3 border rounded-lg text-black bg-white"
            />
          </div>
        </div>

        {/* Upload Ảnh */}
        <div>
          <label className="block font-bold mb-2 text-gray-700">Ảnh thông số / Phụ kiện:</label>
          
          {/* Preview ảnh */}
          {formData.image_url ? (
            <div className="mb-3 p-2 border rounded bg-white text-center relative group">
              <img src={formData.image_url} alt="Preview" className="h-40 mx-auto object-contain" />
              <button 
                type="button"
                onClick={() => setFormData(prev => ({...prev, image_url: ''}))}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
              >
                X
              </button>
            </div>
          ) : (
            <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 mb-3 bg-white">
              Chưa có ảnh nào
            </div>
          )}

          <input 
            type="file" accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
        </div>

        {/* Nút Lưu */}
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-md transform active:scale-95 transition"
        >
          {loading ? 'Đang khởi tạo...' : 'XÁC NHẬN THÊM MỚI'}
        </button>

      </form>
    </div>
  );
}