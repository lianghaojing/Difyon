# Requirements Document

## Introduction

本文档定义了用户注册和登录功能的需求规格。该功能基于以下技术栈构建：

- **前端**: Next.js 15 (App Router) + React 19 + Tailwind CSS v4
- **认证**: Auth.js v5 (NextAuth v5)，支持 Credentials Provider 和 Google OAuth Provider
- **ORM / 数据库**: Prisma + PostgreSQL（邮箱字段设置 UNIQUE 约束）
- **部署**: Vercel（或兼容 Node.js 18+ 的平台）

系统为用户提供完整的认证流程，包括邮箱密码注册、Google OAuth 社交登录、邮箱验证、忘记密码/重置密码、会话管理以及必要的错误处理。

## Architecture

### Frontend Layer

| 关注点 | 说明 |
|--------|------|
| 框架 | Next.js 15 App Router（Server Components + Client Components） |
| 样式 | Tailwind CSS v4 |
| 表单 | React Hook Form + Zod schema validation |
| 路由 | /login, /register, /verify-email, /forgot-password, /reset-password |

### Backend Layer

| 关注点 | 说明 |
|--------|------|
| 认证 | Auth.js v5（Credentials Provider + Google OAuth Provider） |
| API | Next.js Route Handlers (app/api/) |
| ORM | Prisma（PostgreSQL adapter） |
| 邮件 | Resend / Nodemailer（用于邮箱验证和密码重置） |
| 安全 | bcrypt 密码哈希、CSRF 保护、速率限制 |

### Database Layer

| 表 | 关键字段 |
|----|----------|
| User | id (UUID), email (UNIQUE), hashedPassword, displayName, emailVerified (DateTime), image, tokenVersion (Int, default 0), provider |
| Account | 用于 OAuth 账户关联（Auth.js 标准表） |
| VerificationToken | identifier, token (hashed), expires |
| PasswordResetToken | identifier, token (hashed), expires |

### Deployment Layer

| 关注点 | 说明 |
|--------|------|
| 平台 | Vercel（或兼容 Node.js 18+ 的平台） |
| 环境变量 | AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, DATABASE_URL, EMAIL_FROM, EMAIL_SERVER |
| HTTPS | 由平台层强制 |

## Glossary

- **Auth_System**: 基于 Auth.js v5 的认证系统，负责处理用户注册、登录（Credentials + Google OAuth）、邮箱验证、密码重置、会话管理等核心认证逻辑
- **Registration_Form**: 用户注册表单组件，收集用户邮箱、显示名称（displayName）、密码等注册信息
- **Login_Form**: 用户登录表单组件，接收用户凭证并发起认证请求，同时提供 Google OAuth 登录入口
- **Session_Manager**: 会话管理模块，负责创建、维护和销毁用户会话，通过 JWT 中的 tokenVersion 字段实现会话撤销机制
- **Password_Hasher**: 密码加密模块，负责对用户密码进行安全哈希处理
- **Input_Validator**: 输入验证模块，负责校验用户提交的表单数据
- **User_Repository**: 用户数据存储层，基于 Prisma ORM 与 PostgreSQL 数据库交互，邮箱字段具有 UNIQUE 约束
- **OAuth_Provider**: Google OAuth 2.0 认证提供者，通过 Auth.js v5 Google Provider 实现社交登录
- **Email_Service**: 邮件发送服务，负责发送邮箱验证链接和密码重置链接
- **Verification_Token**: 邮箱验证令牌，用于确认用户邮箱地址的有效性
- **Password_Reset_Token**: 密码重置令牌，用于验证密码重置请求的合法性
- **Forgot_Password_Form**: 忘记密码表单组件，接收用户邮箱并触发密码重置流程
- **Reset_Password_Form**: 重置密码表单组件，接收新密码并完成密码更新

## Requirements

### Requirement 1: 用户注册

**User Story:** As a 新用户, I want 通过邮箱和密码创建账户, so that 我可以获得系统的访问权限。

#### Acceptance Criteria

1. THE Registration_Form SHALL 提供邮箱地址输入字段（最大长度 254 个字符）、显示名称输入字段（displayName，最大长度 50 个字符）、密码输入字段（最大长度 128 个字符）、确认密码输入字段和提交按钮
2. WHEN 用户提交注册表单, THE Input_Validator SHALL 验证邮箱格式符合 RFC 5322 标准且长度不超过 254 个字符
3. WHEN 用户提交注册表单, THE Input_Validator SHALL 验证显示名称长度不少于 2 个字符且不超过 50 个字符，且不包含前后空格
4. WHEN 用户提交注册表单, THE Input_Validator SHALL 验证密码长度不少于 8 个字符且不超过 128 个字符，并包含至少一个大写字母、一个小写字母和一个数字
5. WHEN 用户提交注册表单, THE Input_Validator SHALL 验证密码字段与确认密码字段的值完全一致
6. IF 邮箱、显示名称、密码或确认密码字段为空, THEN THE Input_Validator SHALL 阻止表单提交并在对应空字段下方显示必填提示信息
7. WHEN 验证通过, THE Password_Hasher SHALL 使用 bcrypt 算法对密码进行哈希处理（cost factor 不低于 10）
8. WHEN 密码哈希完成, THE User_Repository SHALL 将用户邮箱、显示名称和哈希密码存储到数据库中，邮箱字段受 UNIQUE 约束保护
9. IF 提交的邮箱已存在于数据库中（违反 UNIQUE 约束）, THEN THE Auth_System SHALL 返回邮箱已被注册的错误提示，且表单中已填写的邮箱、显示名称和密码字段值保持不变
10. IF 注册过程中数据库操作失败, THEN THE Auth_System SHALL 返回注册失败请稍后重试的错误提示，且表单中已填写的数据保持不变
11. WHEN 注册成功, THE Email_Service SHALL 向用户邮箱发送包含验证链接的邮件
12. WHEN 注册成功, THE Auth_System SHALL 自动为用户创建会话并将用户重定向到邮箱验证提示页面

### Requirement 2: 用户登录（邮箱密码）

**User Story:** As a 已注册用户, I want 使用邮箱和密码登录系统, so that 我可以访问受保护的功能和内容。

#### Acceptance Criteria

1. THE Login_Form SHALL 提供邮箱地址输入字段（最大长度 254 个字符）、密码输入字段（最大长度 128 个字符）、提交按钮和 Google OAuth 登录按钮
2. WHEN 用户提交登录表单, THE Input_Validator SHALL 验证邮箱和密码字段在去除首尾空格后均不为空，且邮箱格式符合基本邮箱格式（包含 @ 符号和域名部分）
3. WHEN 验证通过, THE Auth_System SHALL 根据邮箱从数据库中查询对应的用户记录
4. WHEN 用户记录存在, THE Auth_System SHALL 使用 bcrypt 比较提交的密码与存储的哈希密码
5. WHEN 密码验证通过, THE Session_Manager SHALL 创建一个新的认证会话并设置 HTTP-only、Secure、SameSite=Lax 属性的 cookie
6. WHEN 登录成功, THE Auth_System SHALL 将用户重定向到 URL 查询参数 callbackUrl 指定的页面；IF callbackUrl 参数不存在或为空, THEN THE Auth_System SHALL 将用户重定向到默认首页
7. IF 邮箱不存在或密码不匹配, THEN THE Auth_System SHALL 返回错误提示表明邮箱或密码错误，且保留用户已输入的邮箱地址在表单中
8. IF 登录过程中发生服务器错误, THEN THE Auth_System SHALL 返回错误提示表明登录失败需稍后重试，且保留用户已输入的邮箱地址在表单中

### Requirement 3: Google OAuth 登录

**User Story:** As a 用户, I want 使用 Google 账号一键登录, so that 我无需记忆额外的密码即可快速访问系统。

#### Acceptance Criteria

1. THE Login_Form SHALL 在邮箱密码表单上方或下方提供一个明确标识的"使用 Google 登录"按钮
2. THE Registration_Form SHALL 在邮箱密码表单上方或下方提供一个明确标识的"使用 Google 注册"按钮
3. WHEN 用户点击 Google 登录按钮, THE OAuth_Provider SHALL 将用户重定向到 Google OAuth 2.0 授权页面，请求 openid、email 和 profile 权限范围
4. WHEN Google 授权成功并返回授权码, THE Auth_System SHALL 使用授权码交换访问令牌并获取用户的 email、name 和 avatar 信息
5. WHEN 获取到 Google 用户信息且该邮箱在数据库中不存在, THE User_Repository SHALL 创建新用户记录，将 Google 提供的 email 存储为用户邮箱、name 存储为 displayName、avatar 存储为 image，并将 emailVerified 设置为当前时间
6. WHEN 获取到 Google 用户信息且该邮箱在数据库中已存在, THE Auth_System SHALL 将 Google OAuth 账户关联到已有用户记录
7. WHEN Google OAuth 登录成功, THE Session_Manager SHALL 创建认证会话并将用户重定向到首页或 callbackUrl 指定的页面
8. IF Google OAuth 授权过程中用户取消授权或发生错误, THEN THE Auth_System SHALL 将用户重定向回登录页面并显示错误提示表明 Google 登录失败请重试
9. IF Google 返回的邮箱与已有 Credentials 用户邮箱相同, THEN THE Auth_System SHALL 将 OAuth 账户关联到已有用户，用户后续可使用任一方式登录

### Requirement 4: 邮箱验证

**User Story:** As a 系统管理员, I want 验证用户注册邮箱的真实性, so that 系统中不存在虚假邮箱账户且密码重置等功能可以正常工作。

#### Acceptance Criteria

1. WHEN 用户通过邮箱密码方式注册成功, THE Email_Service SHALL 在 5 秒内向用户邮箱发送一封包含验证链接的邮件
2. THE Verification_Token SHALL 包含一个使用 crypto.randomUUID 生成的唯一令牌，有效期为 24 小时
3. THE Email_Service SHALL 将验证链接格式设置为 {BASE_URL}/verify-email?token={hashed_token}
4. WHEN 用户点击验证链接且令牌有效, THE Auth_System SHALL 将用户的 emailVerified 字段更新为当前时间，并将用户重定向到登录页面显示验证成功提示
5. IF 用户点击验证链接且令牌已过期, THEN THE Auth_System SHALL 显示令牌已过期的提示，并提供重新发送验证邮件的按钮
6. IF 用户点击验证链接且令牌无效或不存在, THEN THE Auth_System SHALL 显示链接无效的错误提示
7. WHEN 验证令牌被成功使用, THE Auth_System SHALL 立即从数据库中删除该令牌记录
8. WHEN 用户请求重新发送验证邮件, THE Email_Service SHALL 删除该用户之前的所有未使用验证令牌，生成新令牌并发送新的验证邮件
9. THE Auth_System SHALL 对重新发送验证邮件接口实施速率限制，同一邮箱在 5 分钟内最多允许发送 3 次

### Requirement 5: 忘记密码与重置密码

**User Story:** As a 已注册用户, I want 在忘记密码时通过邮箱重置密码, so that 我可以恢复对账户的访问权限。

#### Acceptance Criteria

1. THE Login_Form SHALL 在密码输入字段下方提供一个"忘记密码？"链接，指向 /forgot-password 页面
2. THE Forgot_Password_Form SHALL 提供邮箱地址输入字段和提交按钮
3. WHEN 用户提交忘记密码表单, THE Input_Validator SHALL 验证邮箱格式符合基本邮箱格式
4. WHEN 邮箱验证通过, THE Auth_System SHALL 始终返回相同的成功提示（"如果该邮箱已注册，重置链接已发送"），无论该邮箱是否存在于数据库中
5. WHEN 邮箱存在于数据库中, THE Email_Service SHALL 发送包含密码重置链接的邮件，链接格式为 {BASE_URL}/reset-password?token={hashed_token}
6. THE Password_Reset_Token SHALL 包含一个使用 crypto.randomUUID 生成的唯一令牌，有效期为 1 小时
7. WHEN 用户点击重置链接且令牌有效, THE Reset_Password_Form SHALL 显示新密码输入字段和确认新密码输入字段
8. WHEN 用户提交新密码, THE Input_Validator SHALL 验证新密码符合与注册时相同的密码强度要求
9. WHEN 新密码验证通过, THE Password_Hasher SHALL 对新密码进行 bcrypt 哈希处理，THE User_Repository SHALL 更新用户的哈希密码
10. WHEN 密码重置成功, THE Auth_System SHALL 删除该用户的所有密码重置令牌，将该用户的 tokenVersion 递增 1（使所有现有 JWT 会话失效），并将用户重定向到登录页面显示密码已重置的成功提示
11. IF 用户点击重置链接且令牌已过期, THEN THE Auth_System SHALL 显示令牌已过期的提示，并提供返回忘记密码页面的链接
12. IF 用户点击重置链接且令牌无效或不存在, THEN THE Auth_System SHALL 显示链接无效的错误提示
13. THE Auth_System SHALL 对忘记密码接口实施速率限制，同一 IP 地址在 15 分钟内最多允许 3 次请求

### Requirement 6: 会话管理

**User Story:** As a 已登录用户, I want 系统维持我的登录状态, so that 我不需要频繁重新登录。

#### Acceptance Criteria

1. THE Session_Manager SHALL 使用 JWT 令牌存储会话信息，令牌中至少包含用户唯一标识符、邮箱地址、displayName 和 tokenVersion
2. THE Session_Manager SHALL 将会话有效期设置为自令牌创建时间起 7 天
3. WHEN 用户访问受保护页面且会话有效, THE Session_Manager SHALL 从数据库中查询用户当前的 tokenVersion，并与 JWT 中存储的 tokenVersion 进行比较；IF 两者一致, THEN 允许访问并返回用户唯一标识符、邮箱地址和 displayName
4. WHEN 用户访问受保护页面且会话已过期, THE Session_Manager SHALL 将用户重定向到登录页面
5. WHEN 用户点击退出登录按钮, THE Session_Manager SHALL 销毁当前会话并清除认证会话 cookie
6. WHEN 会话销毁完成, THE Auth_System SHALL 将用户重定向到登录页面
7. IF 用户访问受保护页面时 JWT 令牌签名无效或令牌格式错误, THEN THE Session_Manager SHALL 销毁当前会话并将用户重定向到登录页面
8. IF JWT 中的 tokenVersion 与数据库中用户当前的 tokenVersion 不一致, THEN THE Session_Manager SHALL 视该会话为无效，销毁当前会话并将用户重定向到登录页面
9. WHEN 需要使某用户的所有现有会话失效时（如密码重置成功后）, THE Auth_System SHALL 将该用户数据库记录中的 tokenVersion 字段递增 1，从而使所有包含旧 tokenVersion 的 JWT 令牌在下次验证时失效

### Requirement 7: 表单交互体验

**User Story:** As a 用户, I want 在填写表单时获得即时反馈, so that 我可以快速修正输入错误。

#### Acceptance Criteria

1. WHEN 用户离开某个输入字段（blur 事件）, THE Input_Validator SHALL 在 200ms 内对该字段进行验证，验证通过时在字段旁显示绿色对勾图标，验证失败时触发错误提示显示
2. WHILE 表单正在提交, THE Registration_Form SHALL 禁用提交按钮并在按钮内显示加载旋转图标（spinner），替换原有按钮文本
3. WHILE 表单正在提交, THE Login_Form SHALL 禁用提交按钮并在按钮内显示加载旋转图标（spinner），替换原有按钮文本
4. WHEN 验证失败, THE Input_Validator SHALL 在对应字段下方显示红色错误提示文本
5. WHEN 用户在密码输入字段中输入内容, THE Registration_Form SHALL 实时更新密码强度指示器，显示以下四个等级之一：弱（少于 8 字符）、中（满足长度但缺少字符类型多样性）、强（满足 8 字符以上且包含大小写字母和数字）、非常强（满足强的条件且包含特殊字符且长度不少于 12 字符）
6. THE Login_Form SHALL 提供"显示/隐藏密码"切换按钮，点击后在明文显示与掩码显示之间切换密码字段的内容
7. IF 表单提交后 30 秒内未收到服务器响应, THEN THE Registration_Form 和 Login_Form SHALL 恢复提交按钮为可用状态，移除加载指示器，并显示"请求超时，请重试"的错误提示

### Requirement 8: 页面布局与导航

**User Story:** As a 用户, I want 在登录和注册页面之间方便切换, so that 我可以根据需要选择对应的操作。

#### Acceptance Criteria

1. THE Login_Form SHALL 在表单下方提供指向注册页面（/register）的可点击链接文本
2. THE Registration_Form SHALL 在表单下方提供指向登录页面（/login）的可点击链接文本
3. THE Auth_System SHALL 将登录页面路由设置为 /login
4. THE Auth_System SHALL 将注册页面路由设置为 /register
5. THE Auth_System SHALL 将邮箱验证页面路由设置为 /verify-email
6. THE Auth_System SHALL 将忘记密码页面路由设置为 /forgot-password
7. THE Auth_System SHALL 将重置密码页面路由设置为 /reset-password
8. WHILE 用户已登录, WHEN 用户访问 /login 或 /register 页面, THE Auth_System SHALL 将用户重定向到首页（/）
9. WHEN 用户点击登录页面中的注册链接, THE Auth_System SHALL 通过客户端路由导航到 /register 页面，无需整页刷新
10. WHEN 用户点击注册页面中的登录链接, THE Auth_System SHALL 通过客户端路由导航到 /login 页面，无需整页刷新

### Requirement 9: 安全防护

**User Story:** As a 系统管理员, I want 系统具备基本的安全防护措施, so that 用户账户和数据得到保护。

#### Acceptance Criteria

1. THE Auth_System SHALL 对登录接口实施速率限制，同一 IP 地址在 15 分钟滑动窗口内最多允许 5 次失败尝试
2. IF 同一 IP 地址在 15 分钟滑动窗口内登录失败超过 5 次, THEN THE Auth_System SHALL 锁定该 IP 的登录请求 15 分钟，返回错误提示告知用户尝试次数过多需等待后重试，锁定期满后自动恢复该 IP 的登录权限
3. THE Auth_System SHALL 在所有认证相关的 API 请求中验证 CSRF 令牌
4. IF CSRF 令牌缺失或验证失败, THEN THE Auth_System SHALL 拒绝该请求并返回错误提示告知请求无效，且不执行任何数据变更操作
5. THE Password_Hasher SHALL 对每个密码使用长度不少于 16 字节的唯一随机盐值进行哈希
6. THE Auth_System SHALL 通过 HTTPS 传输所有认证相关数据
7. WHEN 用户通过 HTTP 协议访问认证相关页面, THE Auth_System SHALL 将请求重定向到对应的 HTTPS 地址
8. THE User_Repository SHALL 在数据库层对 email 字段设置 UNIQUE 约束，防止重复注册
9. THE Auth_System SHALL 在存储验证令牌和密码重置令牌前使用 SHA-256 对令牌进行哈希处理，数据库中不存储明文令牌
