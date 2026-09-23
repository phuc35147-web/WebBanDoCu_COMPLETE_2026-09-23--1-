const {poolPromise,sql}=require('./dbConfig');
class SanPhamDAL{
 async getAll(f={}){const p=await poolPromise;let q=`SELECT sp.*,dm.TenDanhMuc,nd.HoTen TenNguoiBan,nd.SoDienThoai SdtNguoiBan FROM SanPhamDoCu sp JOIN DanhMuc dm ON dm.MaDanhMuc=sp.MaDanhMuc JOIN NguoiDung nd ON nd.MaNguoiDung=sp.MaNguoiBan WHERE sp.TrangThai=N'Đang bán' AND sp.SoLuong>0`;const r=p.request();if(f.keyword){q+=' AND(sp.TenSanPham LIKE @kw OR sp.MoTa LIKE @kw)';r.input('kw',sql.NVarChar,`%${f.keyword}%`);}if(f.maDanhMuc){q+=' AND sp.MaDanhMuc=@cat';r.input('cat',sql.Int,Number(f.maDanhMuc));}if(f.tinhTrang){q+=' AND sp.TinhTrang=@cond';r.input('cond',sql.NVarChar,f.tinhTrang);}if(f.location){q+=' AND sp.DiaChiXemHang LIKE @loc';r.input('loc',sql.NVarChar,`%${f.location}%`);}q+=' ORDER BY sp.NgayDang DESC';return (await r.query(q)).recordset;}
 async getById(id){const p=await poolPromise;const r=await p.request().input('id',sql.Int,id).query(`UPDATE SanPhamDoCu SET LuotXem=LuotXem+1 WHERE MaSanPham=@id; SELECT sp.*,dm.TenDanhMuc,nd.HoTen TenNguoiBan,nd.Email EmailNguoiBan,nd.SoDienThoai SdtNguoiBan FROM SanPhamDoCu sp JOIN DanhMuc dm ON dm.MaDanhMuc=sp.MaDanhMuc JOIN NguoiDung nd ON nd.MaNguoiDung=sp.MaNguoiBan WHERE sp.MaSanPham=@id`);return r.recordsets[0]?.[0]||null;}
 async create(d){
  const p=await poolPromise;
  return (await p.request()
    .input('seller',sql.Int,d.maNguoiBan)
    .input('cat',sql.Int,d.maDanhMuc)
    .input('name',sql.NVarChar(255),String(d.tenSanPham).trim())
    .input('desc',sql.NVarChar(sql.MAX),String(d.moTa).trim())
    .input('price',sql.Decimal(18,2),Number(d.giaBan))
    .input('cond',sql.NVarChar(100),String(d.tinhTrang).trim())
    .input('qty',sql.Int,Math.max(1,Number(d.soLuong||1)))
    .input('address',sql.NVarChar(500),String(d.diaChiXemHang).trim())
    .input('image',sql.VarChar(1000),d.hinhAnh)
    .query(`INSERT SanPhamDoCu(MaNguoiBan,MaDanhMuc,TenSanPham,MoTa,GiaBan,TinhTrang,SoLuong,DiaChiXemHang,HinhAnh,TrangThai)
            OUTPUT INSERTED.*
            VALUES(@seller,@cat,@name,@desc,@price,@cond,@qty,@address,@image,N'Chờ duyệt')`)).recordset[0];
 }
 async updateOwned(id,seller,d,file){const p=await poolPromise;const r=p.request().input('id',sql.Int,id).input('seller',sql.Int,seller).input('cat',sql.Int,Number(d.maDanhMuc)).input('name',sql.NVarChar(255),String(d.tenSanPham).trim()).input('desc',sql.NVarChar(sql.MAX),String(d.moTa).trim()).input('price',sql.Decimal(18,2),Number(d.giaBan)).input('cond',sql.NVarChar(100),String(d.tinhTrang).trim()).input('qty',sql.Int,Math.max(1,Number(d.soLuong||1))).input('address',sql.NVarChar(500),String(d.diaChiXemHang).trim()); let q=`UPDATE SanPhamDoCu SET MaDanhMuc=@cat,TenSanPham=@name,MoTa=@desc,GiaBan=@price,TinhTrang=@cond,SoLuong=@qty,DiaChiXemHang=@address,TrangThai=N'Chờ duyệt',NgayCapNhat=SYSDATETIME()`; if(file){q+=`,HinhAnh=@image`;r.input('image',sql.VarChar(1000),`/uploads/${file.filename}`);} q+=' OUTPUT INSERTED.* WHERE MaSanPham=@id AND MaNguoiBan=@seller';const out=(await r.query(q)).recordset[0];if(!out)throw Error('Không tìm thấy tin đăng hoặc bạn không có quyền sửa.');return out;}
 async deleteOwned(id,seller){const p=await poolPromise;const r=await p.request().input('id',sql.Int,id).input('seller',sql.Int,seller).query(`DELETE FROM SanPhamDoCu WHERE MaSanPham=@id AND MaNguoiBan=@seller`);if(!r.rowsAffected[0])throw Error('Không tìm thấy tin đăng hoặc bạn không có quyền xóa.');return true;}
 async getCategories(){const p=await poolPromise;return (await p.request().query('SELECT * FROM DanhMuc WHERE TrangThai=1 ORDER BY TenDanhMuc')).recordset;}
 async getAllForAdmin(){const p=await poolPromise;return (await p.request().query(`SELECT sp.*,dm.TenDanhMuc,nd.HoTen TenNguoiBan,nd.Email EmailNguoiBan FROM SanPhamDoCu sp JOIN DanhMuc dm ON dm.MaDanhMuc=sp.MaDanhMuc JOIN NguoiDung nd ON nd.MaNguoiDung=sp.MaNguoiBan ORDER BY sp.NgayDang DESC`)).recordset;}
 async updateStatus(id,status){const p=await poolPromise;await p.request().input('id',sql.Int,id).input('st',sql.NVarChar(30),status).query('UPDATE SanPhamDoCu SET TrangThai=@st,NgayCapNhat=SYSDATETIME() WHERE MaSanPham=@id');}
}
module.exports=new SanPhamDAL();
