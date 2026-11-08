<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moneeb Global Hub - خدمات تجارية وعامة</title>
    <!-- تضمين Pi SDK الرسمية -->
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        :root {
            --primary-color: #6a1b9a; /* اللون البنفسجي المميز لشبكة Pi */
            --secondary-color: #f3e5f5;
            --accent-color: #ffb300;
            --text-color: #333;
            --bg-color: #f9f9f9;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: var(--bg-color);
            color: var(--text-color);
        }
        header {
            background: var(--primary-color);
            color: white;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .user-status {
            font-size: 14px;
            margin-top: 8px;
            color: var(--accent-color);
            font-weight: bold;
        }
        .container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 0 15px;
        }
        .section-title {
            border-bottom: 2px solid var(--primary-color);
            padding-bottom: 5px;
            margin-top: 30px;
            color: var(--primary-color);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            text-align: center;
            transition: transform 0.2s;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h3 {
            margin-top: 0;
            color: var(--primary-color);
        }
        .btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
            transition: background 0.2s;
        }
        .btn:hover {
            background-color: #4a148c;
        }
        .price {
            color: #d32f2f;
            font-weight: bold;
            font-size: 1.1em;
            margin: 10px 0;
        }
    </style>
</head>
<body>

    <header>
        <h1>Moneeb Global Hub</h1>
        <p>منصة الخدمات التجارية العامة على Pi Network</p>
        <div id="userInfo" class="user-status">جاري الاتصال بحساب Pi...</div>
    </header>

    <div class="container">
        <!-- قسم المتجر التجاري -->
        <h2 class="section-title">🛒 المتجر التجاري (Commercial Store)</h2>
        <div class="grid">
            <div class="card">
                <h3>اسم المنتج أو الخدمة الأولى</h3>
                <p>اكتب هنا وصفاً مختصراً للمنتج أو الخدمة التي تقدمها للعملاء.</p>
                <div class="price">5.0 Pi</div>
                <button class="btn" onclick="buyService('prod_01', 'اسم المنتج الأول', 5.0)">شراء الآن</button>
            </div>
            <div class="card">
                <h3>اسم المنتج أو الخدمة الثانية</h3>
                <p>وصف تفصيلي للخدمة أو السلعة الرقمية أو الحقيقية المعروضة للبيع.</p>
                <div class="price">15.0 Pi</div>
                <button class="btn" onclick="buyService('prod_02', 'اسم المنتج الثاني', 15.0)">شراء الآن</button>
            </div>
        </div>

        <!-- قسم الخدمات العامة -->
        <h2 class="section-title">🌐 الخدمات العامة والمجتمعية (Public Services)</h2>
        <div class="grid">
            <div class="card">
                <h3>عنوان الخدمة العامة الأولى</h3>
                <p>شرح مبسط عن هذه الخدمة المجتمعية أو العامة وكيف يستفيد منها مستخدمو التطبيق.</p>
                <button class="btn" onclick="openPublicService('GeneralService1')">استعراض الخدمة</button>
            </div>
            <div class="card">
                <h3>عنوان الخدمة العامة الثانية</h3>
                <p>شرح مبسط عن خدمة أخرى (مثل الدعم، دليل الأماكن، أو التواصل المباشر).</p>
                <button class="btn" onclick="openPublicService('GeneralService2')">التفاصيل</button>
            </div>
        </div>
    </div>

    <script>
        // تهيئة Pi SDK
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: true });

        let currentUser = null;

        // تسجيل الدخول التلقائي للمستخدم عبر Pi Browser
        async function authenticateUser() {
            try {
                const scopes = ['username', 'payments'];
                const user = await Pi.authenticate(scopes, (payment) => {
                    console.log("دفعة معلقة تم العثور عليها:", payment);
                });
                currentUser = user;
                document.getElementById('userInfo').innerText = `مرحباً بك، @${user.username}`;
            } catch (error) {
                console.error("خطأ في المصادقة:", error);
                document.getElementById('userInfo').innerText = "يرجى فتح التطبيق عبر Pi Browser لتسجيل الدخول";
            }
        }

        window.onload = authenticateUser;

        // دالة إتمام الشراء والدفع عبر Pi SDK
        async function buyService(serviceId, serviceName, amountPi) {
            if (!currentUser) {
                alert("يرجى تسجيل الدخول عبر متصفح Pi أولاً.");
                return;
            }

            try {
                const paymentData = {
                    amount: amountPi,
                    memo: `شراء خدمة: ${serviceName}`,
                    metadata: { serviceId: serviceId }
                };

                const callbacks = {
                    onReadyForServerApproval: async (paymentId) => {
                        console.log("جاهز لموافقة السيرفر:", paymentId);
                        // إرسال paymentId إلى السيرفر الخلفي للموافقة لاحقاً
                    },
                    onReadyForServerCompletion: async (paymentId, txid) => {
                        console.log("تم الدفع بنجاح، رقم المعاملة:", txid);
                        alert(`تمت عملية الشراء بنجاح للخدمة: ${serviceName}!`);
                        // إبلاغ السيرفر بإتمام المعاملة ومنح الخدمة
                    },
                    onCancel: (paymentId) => {
                        console.log("تم إلغاء الدفع:", paymentId);
                    },
                    onError: (error, payment) => {
                        console.error("حدث خطأ أثناء الدفع:", error);
                        alert("حدث خطأ أثناء إتمام عملية الدفع.");
                    }
                };

                Pi.createPayment(paymentData, callbacks);
            } catch (err) {
                console.error("خطأ في إنشاء طلب الدفع:", err);
            }
        }

        function openPublicService(serviceType) {
            alert(`جاري فتح قسم: ${serviceType}`);
        }
    </script>
</body>
</html># moneeb-global-pi
تطبيق خدمات تجارية وعامة على شبكة Pi Network
