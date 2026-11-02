module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      customerEmail,
      customerName,
      orderId,
      item,
      amount
    } = req.body || {};

    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email missing" });
    }

    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return res.status(500).json({ error: "Email settings missing" });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [customerEmail],
        subject: "Your CurioBloom Order is Confirmed! 🌱",
        text: `Hi ${customerName || "there"},

Your CurioBloom order has been received successfully!

Order ID: ${orderId || "N/A"}
Item: ${item || "CurioBloom Kit"}
Amount: ${amount || "N/A"}

Your order will be delivered in 5 to 7 business days.

Thank you for choosing CurioBloom! 🌱`
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return res.status(502).json({ error: "Email could not be sent" });
    }

    return res.status(200).json({
      success: true,
      message: "Order email sent"
    });

  } catch (error) {
    console.error("Email API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
