export default {

  async fetch(request, env) {

    if (request.method === "OPTIONS") {

      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });

    }


    if (request.method !== "POST") {

      return jsonResponse(
        {
          success: false,
          message: "শুধুমাত্র POST request অনুমোদিত।"
        },
        405
      );

    }


    try {

      const contentType =
        request.headers.get("content-type") || "";


      if (
        !contentType.includes(
          "application/json"
        )
      ) {

        return jsonResponse(
          {
            success: false,
            message: "Invalid request format."
          },
          400
        );

      }


      const body =
        await request.json();


      if (
        body.type !==
        "new_seller"
      ) {

        return jsonResponse(
          {
            success: false,
            message: "Invalid notification type."
          },
          400
        );

      }


      if (
        !body.uid ||
        !body.email ||
        !body.fullName ||
        !body.shopName
      ) {

        return jsonResponse(
          {
            success: false,
            message: "Required information missing."
          },
          400
        );

      }


      const message = `
🟠 GHOTI MARKET — নতুন Seller Account

━━━━━━━━━━━━━━━━━━

👤 নাম:
${body.fullName}

🏪 শপ:
${body.shopName}

📧 Email:
${body.email}

📱 WhatsApp:
${body.whatsapp || "N/A"}

🆔 UID:
${body.uid}

━━━━━━━━━━━━━━━━━━

নতুন Seller verification request এসেছে।

সময়:
${new Date().toLocaleString(
  "en-US",
  {
    timeZone:"Asia/Dhaka"
  }
)}
`;


      const telegramURL =
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;


      const telegramResponse =
        await fetch(
          telegramURL,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

              chat_id:
                env.TELEGRAM_CHAT_ID,

              text:
                message,

              disable_web_page_preview:
                true

            })

          }
        );


      const result =
        await telegramResponse.json();


      if (
        !telegramResponse.ok ||
        !result.ok
      ) {

        console.error(
          "Telegram Error:",
          result
        );


        return jsonResponse(
          {
            success:false,
            message:
              "Telegram notification পাঠানো যায়নি।"
          },
          502
        );

      }


      return jsonResponse({
        success:true,
        message:
          "Notification sent successfully."
      });


    } catch(error) {

      console.error(
        "Notification Worker Error:",
        error
      );


      return jsonResponse(
        {
          success:false,
          message:
            "Notification server error হয়েছে।"
        },
        500
      );

    }

  }

};


function corsHeaders(){

  return {

    "Access-Control-Allow-Origin":
      "https://seller.ghotimarket.com",

    "Access-Control-Allow-Methods":
      "POST, OPTIONS",

    "Access-Control-Allow-Headers":
      "Content-Type",

    "Access-Control-Max-Age":
      "86400"

  };

}


function jsonResponse(
  data,
  status=200
){

  return new Response(
    JSON.stringify(data),
    {
      status,

      headers:{
        "Content-Type":
          "application/json; charset=UTF-8",

        ...corsHeaders()
      }
    }
  );

}
