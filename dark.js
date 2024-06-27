//BẠN CODE BE VÀ THÈN CLIENT CẦN BẠN CHÔM DATA CỦA BÊN KHÁC VỀ CHO NÓ
//Y/C LÀ PHẢI TRẢ RA NHANH, NÓ SẼ REQUEST LIÊN TỤC ĐỂ LẤY DATA ẤY 
//VÀ CAO THỦ C# ĐÃ LỢI DỤNG BẤT ĐỒNG BỘ TRONG JS NTN?


//Đầu tiên hắn ta tạo một hàm để get và trả ra data từ database

const axios = require('axios');
try {
    const data = await data.findAll();


    /// Tiếp đến hắn ta tạo một hàm để get(chôm) data từ bên kia về :_)
    //ở đây không dùng async await.
    //Tránh việc get liên tục hắn tạo thêm một hàm để check time nhằm không làm cho bên chôm chỉa phát hiện =]
    const time_now = new Date();
    if(data.time > 10 || data.time < -10){// chỗ này phải convert về giây nhé 
    axios.get("DataVudz.com").then(async (res) =>{ // Có thể thấy ở đây hắn ta không dùng async await
        const datachom= await data.findAll();
        //ở đây hắn gán data vừa chôm về vào csdl của hắn
        my_data.update(datachom);
        //Data chôm chỉa dễ sập nên vứt vô try catch tránh chết server =]]
    }).catch((err) =>  console.log("Lỗi rồi", err)
      
    )

    //Tổng quan có thể thấy rằng có một điểm yếu ở đây là lần đầu load luôn trả về data rỗng
    //Tuy nhiên sau lần init data thì sẽ không còn trường hợp này nữa
    //Vậy là mình vừa chôm được data, có data backup, vừa trả về res nhanh cho client
    //Còn vụ chôm data thì mình sẽ để cho nó chạy ở background??? Cái này AI tự viết :_)



    //Tức là sau lần đầu, những lần client request lên lấy data nó luôn được lưu sẵn trong server và tốc độ trả về rất nhanh
    //Tiếp đến cứ sau 10s thì hàm chôm data sẽ được kích hoạt và đương nhiên nó luôn chạy sau khi đã data đã được trả ra rồi
    //Vậy là chúng ta không cần đợi hàm chôm data chạy xong mới trả về kết quả :)
    //Đương nhiên data sẽ không được realtime theo phía bên kia, tuy nhiên đây là giải pháp khá tối ưu.
    //Ai có ý tưởng hay hơn không :3
}
    res.status(200).json({ message: "Data chôm của bạn đây :V", data });

} catch (error) {
    
}