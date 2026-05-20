import type { AuthLocale } from "@/lib/i18n/auth";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageCopy = {
  backToSignUp: string;
  legalLabel: string;
  contentsLabel: string;
  lastUpdated: string;
  termsTitle: string;
  termsIntro: string;
  privacyTitle: string;
  privacyIntro: string;
  terms: LegalSection[];
  privacy: LegalSection[];
};

export const legalCopy: Record<AuthLocale, LegalPageCopy> = {
  en: {
    backToSignUp: "Back to sign up",
    legalLabel: "Legal",
    contentsLabel: "Contents",
    lastUpdated: "Last updated: May 20, 2026",
    termsTitle: "Terms of Service",
    termsIntro:
      "These Terms explain the rules for using Difyon. They are written for clarity and product planning, but they are not legal advice. Review them with qualified counsel before public launch.",
    privacyTitle: "Privacy Policy",
    privacyIntro:
      "This Privacy Policy explains how Difyon collects, uses, shares, and protects information. It is a working product draft and should be reviewed by qualified legal counsel before public launch.",
    terms: [
      {
        title: "1. Acceptance of these Terms",
        body: [
          "By creating an account, signing in, or using Difyon, you agree to these Terms of Service. If you do not agree, do not use the service.",
          "These Terms are a working product draft for Difyon and should be reviewed by qualified legal counsel before public launch.",
        ],
      },
      {
        title: "2. Accounts and authentication",
        body: [
          "You are responsible for keeping your account credentials secure and for all activity that happens under your account.",
          "You must provide accurate account information and keep your email address accessible. We may require email verification before you can access protected features.",
          "If you use a third-party login provider, such as Google, your use of that provider is also governed by that provider's terms and policies.",
        ],
      },
      {
        title: "3. Permitted use",
        body: [
          "You may use Difyon only for lawful purposes and in a way that does not harm, overload, disrupt, or attempt to gain unauthorized access to the service.",
          "You may not abuse registration, login, verification, reset-password, payment, recharge, or account-management flows.",
          "You may not use Difyon to process illegal content, violate another person's rights, or attempt fraud, money laundering, or unauthorized transactions.",
        ],
      },
      {
        title: "4. Balances, credits, and paid features",
        body: [
          "Difyon may offer paid features, account balances, credits, or recharge options. Unless we state otherwise, balances and credits are for use inside Difyon only.",
          "Balances and credits are not bank deposits, stored-value accounts, securities, or cash equivalents. They are not transferable and are not withdrawable unless a written policy says otherwise.",
          "Recharge, payment, refund, expiration, and dispute rules may be described in additional product terms, checkout notices, or billing pages.",
        ],
      },
      {
        title: "5. Service changes and availability",
        body: [
          "We may change, suspend, or discontinue features as the product evolves. We will try to avoid unnecessary disruption, but we do not guarantee that every feature will always be available.",
          "We may limit or block access when needed to protect users, prevent abuse, comply with law, or maintain the service.",
        ],
      },
      {
        title: "6. User content and data",
        body: [
          "You are responsible for the content and information you provide to Difyon.",
          "You grant Difyon the rights needed to operate, secure, improve, and provide the service, including storing and processing information you submit.",
          "Our handling of personal information is described in our Privacy Policy.",
        ],
      },
      {
        title: "7. Security",
        body: [
          "We use reasonable technical and organizational measures to protect the service, but no system is perfectly secure.",
          "You must notify us promptly if you believe your account has been compromised or used without authorization.",
        ],
      },
      {
        title: "8. Disclaimers and limitation of liability",
        body: [
          'Difyon is provided on an "as is" and "as available" basis. To the maximum extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.',
          "To the maximum extent allowed by law, Difyon will not be liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, data, or goodwill.",
        ],
      },
      {
        title: "9. Termination",
        body: [
          "You may stop using Difyon at any time. We may suspend or terminate access if you violate these Terms, create risk, or use the service in a harmful or unlawful way.",
          "After termination, some information may be retained as required for security, compliance, dispute resolution, or legitimate business purposes.",
        ],
      },
      {
        title: "10. Changes to these Terms",
        body: [
          "We may update these Terms as the product changes. If changes are material, we will provide notice through the service or another reasonable method.",
          "Your continued use of Difyon after changes take effect means you accept the updated Terms.",
        ],
      },
      {
        title: "11. Contact",
        body: [
          "For questions about these Terms, contact the Difyon team using the support channel or contact information provided in the product.",
        ],
      },
    ],
    privacy: [
      {
        title: "1. Information we collect",
        body: [
          "Account information: email address, display name, authentication identifiers, email verification status, profile image from supported providers, and account timestamps.",
          "Authentication information: hashed passwords, password reset tokens, email verification tokens, session metadata, token-version data used for session revocation, and login-related security signals.",
          "Usage and technical information: pages visited, actions taken, device and browser information, IP address, logs, diagnostics, and error data needed to operate and secure the service.",
          "Payment or recharge information: if paid features, balances, or recharge options are enabled, we may process order IDs, provider references, transaction hashes, payment status, balance records, and ledger entries. We should not store full payment card details unless a compliant payment provider requires and supports it.",
        ],
      },
      {
        title: "2. How we use information",
        body: [
          "To create and secure your account, verify email ownership, authenticate sessions, and help you recover access.",
          "To provide product features, account management, billing, recharge, balance, support, and administrative workflows.",
          "To prevent fraud, abuse, unauthorized access, account takeover, spam, and misuse of authentication or payment flows.",
          "To debug issues, improve reliability, measure product performance, and develop new features.",
          "To comply with legal obligations, enforce our Terms, and resolve disputes.",
        ],
      },
      {
        title: "3. Cookies and session technology",
        body: [
          "Difyon uses cookies and similar technologies for authentication, session management, CSRF protection, callback URLs, and security.",
          "Some cookies are essential for the service to work. If you block them, login and account features may not function correctly.",
        ],
      },
      {
        title: "4. Third-party services",
        body: [
          "Difyon may use third-party services for authentication, email delivery, hosting, analytics, payments, recharge processing, support, and security.",
          "For example, if you sign in with Google, Google may process information according to its own policies. If paid features are enabled, payment providers may process payment or compliance information according to their own policies.",
        ],
      },
      {
        title: "5. How we share information",
        body: [
          "We do not sell personal information.",
          "We may share information with service providers who help us operate Difyon, such as hosting, email, authentication, analytics, payment, and security providers.",
          "We may disclose information if required by law, to protect rights and safety, to investigate abuse, or as part of a business transfer such as a merger or acquisition.",
        ],
      },
      {
        title: "6. Data retention",
        body: [
          "We keep information for as long as needed to provide the service, maintain security, comply with legal obligations, resolve disputes, and enforce agreements.",
          "Security logs, account records, billing records, recharge records, and ledger entries may be retained longer when needed for audit, fraud prevention, accounting, or compliance.",
        ],
      },
      {
        title: "7. Security",
        body: [
          "We use reasonable safeguards such as password hashing, token hashing, session controls, route protection, and rate limiting.",
          "No method of transmission or storage is completely secure. You should use a strong password, protect your email account, and notify us if you suspect unauthorized access.",
        ],
      },
      {
        title: "8. Your choices and rights",
        body: [
          "You may access and update certain account information through the product.",
          "Depending on your location, you may have rights to request access, correction, deletion, restriction, portability, or objection related to your personal information.",
          "Some requests may be limited by security, fraud prevention, accounting, legal, or operational requirements.",
        ],
      },
      {
        title: "9. International processing",
        body: [
          "Difyon and its service providers may process information in countries other than where you live. Data protection laws may differ by location.",
          "When required, we will use appropriate safeguards for international transfers.",
        ],
      },
      {
        title: "10. Children's privacy",
        body: [
          "Difyon is not intended for children under the age required by applicable law to use online services. We do not knowingly collect personal information from children.",
        ],
      },
      {
        title: "11. Changes to this Privacy Policy",
        body: [
          "We may update this Privacy Policy as Difyon changes. If changes are material, we will provide notice through the service or another reasonable method.",
        ],
      },
      {
        title: "12. Contact",
        body: [
          "For privacy questions or requests, contact the Difyon team using the support channel or contact information provided in the product.",
        ],
      },
    ],
  },
  zh: {
    backToSignUp: "返回注册",
    legalLabel: "法律文件",
    contentsLabel: "目录",
    lastUpdated: "最后更新：2026年5月20日",
    termsTitle: "服务条款",
    termsIntro:
      "本服务条款说明使用 Difyon 的基本规则。本文案用于产品推进和上线前审阅，不构成法律意见。公开上线前建议由专业法律顾问确认。",
    privacyTitle: "隐私政策",
    privacyIntro:
      "本隐私政策说明 Difyon 如何收集、使用、共享和保护信息。本文案用于产品推进和上线前审阅，不构成法律意见。公开上线前建议由专业法律顾问确认。",
    terms: [
      {
        title: "1. 接受本条款",
        body: [
          "当您创建账户、登录或使用 Difyon 时，即表示您同意本服务条款。如果您不同意，请不要使用本服务。",
          "本条款是 Difyon 的产品草案版本，公开上线前应由合格法律顾问审阅。",
        ],
      },
      {
        title: "2. 账户与身份验证",
        body: [
          "您需要负责保护自己的账户凭证，并对账户下发生的活动负责。",
          "您应提供准确的账户信息，并确保邮箱可正常接收邮件。部分受保护功能可能要求您先完成邮箱验证。",
          "如果您使用 Google 等第三方登录服务，该第三方服务也会适用其自己的条款和政策。",
        ],
      },
      {
        title: "3. 允许的使用方式",
        body: [
          "您只能以合法方式使用 Difyon，不得损害、过载、干扰服务，或尝试未授权访问。",
          "您不得滥用注册、登录、验证、重置密码、支付、充值或账户管理流程。",
          "您不得使用 Difyon 处理非法内容、侵犯他人权利，或尝试欺诈、洗钱、未授权交易等行为。",
        ],
      },
      {
        title: "4. 余额、额度与付费功能",
        body: [
          "Difyon 可能提供付费功能、账户余额、额度或充值方式。除非另有说明，余额和额度仅可在 Difyon 内部使用。",
          "余额和额度不是银行存款、储值账户、证券或现金等价物。除非有书面政策说明，否则不可转让、不可提现。",
          "充值、支付、退款、到期和争议处理规则可能会在额外产品条款、结账提示或账单页面中说明。",
        ],
      },
      {
        title: "5. 服务变更与可用性",
        body: [
          "随着产品发展，我们可能变更、暂停或停止部分功能。我们会尽量避免不必要的影响，但不保证每个功能始终可用。",
          "为了保护用户、防止滥用、遵守法律或维护服务，我们可能限制或阻止访问。",
        ],
      },
      {
        title: "6. 用户内容与数据",
        body: [
          "您需要对提交到 Difyon 的内容和信息负责。",
          "您授予 Difyon 为运营、保护、改进和提供服务所必需的权利，包括存储和处理您提交的信息。",
          "我们如何处理个人信息，请见隐私政策。",
        ],
      },
      {
        title: "7. 安全",
        body: [
          "我们会采用合理的技术和组织措施保护服务，但任何系统都无法保证绝对安全。",
          "如果您认为账户被盗用或存在未经授权的使用，应及时通知我们。",
        ],
      },
      {
        title: "8. 免责声明与责任限制",
        body: [
          "在法律允许的最大范围内，Difyon 按“现状”和“可用”提供，不承诺适销性、特定用途适用性或不侵权。",
          "在法律允许的最大范围内，Difyon 不对间接、附带、特殊、后果性或惩罚性损害负责，也不对利润、收入、数据或商誉损失负责。",
        ],
      },
      {
        title: "9. 终止",
        body: [
          "您可以随时停止使用 Difyon。如果您违反本条款、造成风险或以有害/违法方式使用服务，我们可以暂停或终止访问。",
          "终止后，出于安全、合规、争议解决或合理业务目的，部分信息可能会被保留。",
        ],
      },
      {
        title: "10. 条款变更",
        body: [
          "我们可能随着产品变化更新本条款。如果变更重大，我们会通过服务内通知或其他合理方式告知。",
          "变更生效后继续使用 Difyon，即表示您接受更新后的条款。",
        ],
      },
      {
        title: "11. 联系方式",
        body: ["如对本条款有疑问，请通过产品中提供的支持渠道或联系方式联系 Difyon 团队。"],
      },
    ],
    privacy: [
      {
        title: "1. 我们收集的信息",
        body: [
          "账户信息：邮箱地址、显示名称、身份验证标识、邮箱验证状态、第三方登录头像和账户时间戳。",
          "身份验证信息：哈希后的密码、密码重置 token、邮箱验证 token、会话元数据、用于会话失效的 tokenVersion，以及登录相关安全信号。",
          "使用和技术信息：访问页面、操作行为、设备和浏览器信息、IP 地址、日志、诊断和错误数据。",
          "支付或充值信息：如果启用付费功能、余额或充值，我们可能处理订单 ID、支付服务商引用、交易哈希、支付状态、余额记录和流水记录。除非合规支付服务商要求并支持，我们不应存储完整银行卡信息。",
        ],
      },
      {
        title: "2. 我们如何使用信息",
        body: [
          "用于创建和保护账户、验证邮箱、认证会话，以及帮助您找回账户。",
          "用于提供产品功能、账户管理、账单、充值、余额、支持和后台管理流程。",
          "用于防止欺诈、滥用、未授权访问、账户盗用、垃圾注册和支付/认证流程滥用。",
          "用于排查问题、提升可靠性、衡量产品表现和开发新功能。",
          "用于遵守法律义务、执行服务条款和解决争议。",
        ],
      },
      {
        title: "3. Cookie 与会话技术",
        body: [
          "Difyon 使用 Cookie 和类似技术进行身份验证、会话管理、CSRF 保护、回调地址处理和安全保护。",
          "部分 Cookie 是服务正常运行所必需的。如果您阻止这些 Cookie，登录和账户功能可能无法正常使用。",
        ],
      },
      {
        title: "4. 第三方服务",
        body: [
          "Difyon 可能使用第三方服务处理身份验证、邮件发送、托管、分析、支付、充值、客服和安全。",
          "例如，如果您使用 Google 登录，Google 会根据其政策处理相关信息。如果启用付费功能，支付服务商也可能根据其政策处理支付或合规信息。",
        ],
      },
      {
        title: "5. 我们如何共享信息",
        body: [
          "我们不会出售个人信息。",
          "我们可能与帮助运营 Difyon 的服务商共享信息，例如托管、邮件、身份验证、分析、支付和安全服务商。",
          "在法律要求、保护权利和安全、调查滥用，或发生合并、收购等业务转让时，我们可能披露信息。",
        ],
      },
      {
        title: "6. 数据保留",
        body: [
          "我们会在提供服务、维护安全、遵守法律义务、解决争议和执行协议所需期间保留信息。",
          "出于审计、反欺诈、会计或合规目的，安全日志、账户记录、账单记录、充值记录和流水记录可能会保留更长时间。",
        ],
      },
      {
        title: "7. 安全",
        body: [
          "我们使用密码哈希、token 哈希、会话控制、路由保护和限流等合理保护措施。",
          "任何传输或存储方式都无法保证绝对安全。您应使用强密码、保护邮箱账户，并在怀疑未授权访问时通知我们。",
        ],
      },
      {
        title: "8. 您的选择与权利",
        body: [
          "您可以在产品中访问和更新部分账户信息。",
          "根据所在地法律，您可能有权请求访问、更正、删除、限制处理、数据可携带或反对处理个人信息。",
          "部分请求可能会受到安全、反欺诈、会计、法律或运营要求限制。",
        ],
      },
      {
        title: "9. 国际处理",
        body: [
          "Difyon 及其服务商可能会在您所在地以外的国家或地区处理信息。不同地区的数据保护法律可能不同。",
          "在法律要求时，我们会采用适当保障措施处理跨境传输。",
        ],
      },
      {
        title: "10. 儿童隐私",
        body: [
          "Difyon 不面向未达到适用法律规定年龄的儿童。我们不会 knowingly 收集儿童个人信息。",
        ],
      },
      {
        title: "11. 本隐私政策的变更",
        body: [
          "随着 Difyon 变化，我们可能更新本隐私政策。如果变更重大，我们会通过服务内通知或其他合理方式告知。",
        ],
      },
      {
        title: "12. 联系方式",
        body: ["如有隐私问题或请求，请通过产品中提供的支持渠道或联系方式联系 Difyon 团队。"],
      },
    ],
  },
  ru: {
    backToSignUp: "Вернуться к регистрации",
    legalLabel: "Юридическая информация",
    contentsLabel: "Содержание",
    lastUpdated: "Обновлено: 20 мая 2026 г.",
    termsTitle: "Условия использования",
    termsIntro:
      "Эти Условия описывают правила использования Difyon. Текст подготовлен для продуктовой работы и не является юридической консультацией. Перед публичным запуском его следует проверить с юристом.",
    privacyTitle: "Политика конфиденциальности",
    privacyIntro:
      "Эта Политика объясняет, как Difyon собирает, использует, передает и защищает информацию. Текст является рабочим продуктовым черновиком и должен быть проверен юристом перед публичным запуском.",
    terms: [
      {
        title: "1. Принятие условий",
        body: [
          "Создавая аккаунт, входя в систему или используя Difyon, вы соглашаетесь с этими Условиями. Если вы не согласны, не используйте сервис.",
          "Эти Условия являются рабочим черновиком для Difyon и должны быть проверены квалифицированным юристом перед публичным запуском.",
        ],
      },
      {
        title: "2. Аккаунты и аутентификация",
        body: [
          "Вы отвечаете за безопасность своих учетных данных и за все действия в вашем аккаунте.",
          "Вы должны предоставлять точную информацию и поддерживать доступ к своей электронной почте. Для защищенных функций может потребоваться подтверждение email.",
          "Если вы используете сторонний вход, например Google, на него также распространяются условия и политики этого поставщика.",
        ],
      },
      {
        title: "3. Допустимое использование",
        body: [
          "Вы можете использовать Difyon только законно и без вреда, перегрузки, нарушения работы или попыток несанкционированного доступа.",
          "Нельзя злоупотреблять регистрацией, входом, подтверждением, сбросом пароля, платежами, пополнением или управлением аккаунтом.",
          "Нельзя использовать Difyon для незаконного контента, нарушения прав других лиц, мошенничества, отмывания денег или несанкционированных транзакций.",
        ],
      },
      {
        title: "4. Балансы, кредиты и платные функции",
        body: [
          "Difyon может предлагать платные функции, балансы, кредиты или пополнение. Если не указано иное, они предназначены только для использования внутри Difyon.",
          "Балансы и кредиты не являются банковскими депозитами, счетами хранения средств, ценными бумагами или денежными эквивалентами. Они не передаются и не выводятся, если письменная политика не говорит обратное.",
          "Правила пополнения, оплаты, возврата, истечения срока и споров могут описываться в дополнительных условиях, уведомлениях оплаты или разделах биллинга.",
        ],
      },
      {
        title: "5. Изменения и доступность сервиса",
        body: [
          "Мы можем менять, приостанавливать или прекращать функции по мере развития продукта. Мы стараемся избегать лишних сбоев, но не гарантируем постоянную доступность каждой функции.",
          "Мы можем ограничить или заблокировать доступ для защиты пользователей, предотвращения злоупотреблений, соблюдения закона или поддержки сервиса.",
        ],
      },
      {
        title: "6. Контент и данные пользователя",
        body: [
          "Вы отвечаете за контент и информацию, которые предоставляете Difyon.",
          "Вы предоставляете Difyon права, необходимые для работы, защиты, улучшения и предоставления сервиса, включая хранение и обработку отправленной информации.",
          "Обработка персональной информации описана в Политике конфиденциальности.",
        ],
      },
      {
        title: "7. Безопасность",
        body: [
          "Мы используем разумные технические и организационные меры защиты, но ни одна система не является полностью безопасной.",
          "Если вы считаете, что аккаунт скомпрометирован или используется без разрешения, сообщите нам как можно скорее.",
        ],
      },
      {
        title: "8. Отказ от гарантий и ограничение ответственности",
        body: [
          "Difyon предоставляется “как есть” и “по доступности”. В максимально допустимой законом степени мы отказываемся от гарантий товарной пригодности, пригодности для конкретной цели и ненарушения прав.",
          "В максимально допустимой законом степени Difyon не несет ответственности за косвенные, случайные, специальные, последующие или штрафные убытки, а также за потерю прибыли, выручки, данных или деловой репутации.",
        ],
      },
      {
        title: "9. Прекращение",
        body: [
          "Вы можете прекратить использование Difyon в любое время. Мы можем приостановить или прекратить доступ, если вы нарушаете Условия, создаете риск или используете сервис вредным или незаконным способом.",
          "После прекращения часть информации может сохраняться для безопасности, соблюдения требований, разрешения споров или законных деловых целей.",
        ],
      },
      {
        title: "10. Изменения условий",
        body: [
          "Мы можем обновлять эти Условия по мере изменения продукта. При существенных изменениях мы уведомим вас через сервис или другим разумным способом.",
          "Продолжение использования Difyon после вступления изменений в силу означает принятие обновленных Условий.",
        ],
      },
      {
        title: "11. Контакты",
        body: [
          "По вопросам об этих Условиях свяжитесь с командой Difyon через канал поддержки или контактную информацию в продукте.",
        ],
      },
    ],
    privacy: [
      {
        title: "1. Какую информацию мы собираем",
        body: [
          "Информация аккаунта: email, отображаемое имя, идентификаторы аутентификации, статус подтверждения email, изображение профиля от поддерживаемых провайдеров и временные метки аккаунта.",
          "Информация аутентификации: хэшированные пароли, токены сброса пароля, токены подтверждения email, метаданные сессии, данные версии токена для отзыва сессий и сигналы безопасности входа.",
          "Техническая и пользовательская информация: посещенные страницы, действия, устройство и браузер, IP-адрес, логи, диагностика и ошибки.",
          "Платежная или информация пополнения: если включены платные функции, балансы или пополнения, мы можем обрабатывать ID заказов, ссылки провайдеров, хэши транзакций, статус оплаты, записи баланса и бухгалтерские записи. Мы не должны хранить полные данные карт, если это не требуется и не поддерживается compliant-провайдером.",
        ],
      },
      {
        title: "2. Как мы используем информацию",
        body: [
          "Для создания и защиты аккаунта, подтверждения email, аутентификации сессий и восстановления доступа.",
          "Для предоставления функций продукта, управления аккаунтом, биллинга, пополнения, баланса, поддержки и административных процессов.",
          "Для предотвращения мошенничества, злоупотреблений, несанкционированного доступа, захвата аккаунтов, спама и злоупотребления платежными или auth-процессами.",
          "Для отладки, повышения надежности, измерения работы продукта и разработки новых функций.",
          "Для соблюдения правовых обязательств, исполнения Условий и разрешения споров.",
        ],
      },
      {
        title: "3. Cookie и технологии сессий",
        body: [
          "Difyon использует cookie и похожие технологии для аутентификации, управления сессиями, CSRF-защиты, callback URL и безопасности.",
          "Некоторые cookie необходимы для работы сервиса. Если вы их блокируете, вход и функции аккаунта могут работать некорректно.",
        ],
      },
      {
        title: "4. Сторонние сервисы",
        body: [
          "Difyon может использовать сторонние сервисы для аутентификации, email-доставки, хостинга, аналитики, платежей, пополнений, поддержки и безопасности.",
          "Например, при входе через Google, Google может обрабатывать информацию согласно своим политикам. Если включены платные функции, платежные провайдеры могут обрабатывать платежную или compliance-информацию согласно своим политикам.",
        ],
      },
      {
        title: "5. Как мы передаем информацию",
        body: [
          "Мы не продаем персональную информацию.",
          "Мы можем передавать информацию поставщикам услуг, которые помогают работать Difyon, включая хостинг, email, аутентификацию, аналитику, платежи и безопасность.",
          "Мы можем раскрывать информацию, если этого требует закон, для защиты прав и безопасности, расследования злоупотреблений или в рамках передачи бизнеса, например слияния или приобретения.",
        ],
      },
      {
        title: "6. Хранение данных",
        body: [
          "Мы храним информацию столько, сколько необходимо для предоставления сервиса, безопасности, соблюдения закона, разрешения споров и исполнения соглашений.",
          "Логи безопасности, записи аккаунта, биллинг, пополнения и ledger-записи могут храниться дольше для аудита, предотвращения мошенничества, бухгалтерии или compliance.",
        ],
      },
      {
        title: "7. Безопасность",
        body: [
          "Мы используем разумные меры защиты, включая хэширование паролей, хэширование токенов, контроль сессий, защиту маршрутов и лимиты запросов.",
          "Ни один способ передачи или хранения не является полностью безопасным. Используйте надежный пароль, защищайте email и сообщайте нам о подозрении на несанкционированный доступ.",
        ],
      },
      {
        title: "8. Ваш выбор и права",
        body: [
          "Вы можете получать доступ и обновлять некоторые данные аккаунта через продукт.",
          "В зависимости от вашего местоположения у вас могут быть права на доступ, исправление, удаление, ограничение, переносимость или возражение против обработки персональной информации.",
          "Некоторые запросы могут быть ограничены требованиями безопасности, предотвращения мошенничества, бухгалтерии, закона или работы сервиса.",
        ],
      },
      {
        title: "9. Международная обработка",
        body: [
          "Difyon и его поставщики могут обрабатывать информацию в странах, отличных от вашей. Законы о защите данных могут различаться.",
          "Когда требуется, мы будем использовать соответствующие меры защиты международных передач.",
        ],
      },
      {
        title: "10. Конфиденциальность детей",
        body: [
          "Difyon не предназначен для детей младше возраста, требуемого применимым законом для использования онлайн-сервисов. Мы сознательно не собираем персональные данные детей.",
        ],
      },
      {
        title: "11. Изменения политики",
        body: [
          "Мы можем обновлять эту Политику по мере изменения Difyon. При существенных изменениях мы уведомим вас через сервис или другим разумным способом.",
        ],
      },
      {
        title: "12. Контакты",
        body: [
          "По вопросам конфиденциальности или запросам свяжитесь с командой Difyon через канал поддержки или контактную информацию в продукте.",
        ],
      },
    ],
  },
};
