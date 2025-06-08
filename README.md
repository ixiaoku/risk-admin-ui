# risk-admin-ui
以下是一个适用于 risk-admin-ui 项目的 README.md 初始模板，内容涵盖了主要功能模块、技术栈和使用说明：

⸻

risk-admin-ui

risk-admin-ui 是风控系统的前端管理平台，提供风控事件、规则、特征、名单库、处置方案等的可视化管理能力，支持风控业务的配置化接入与数据分析。

✨ 项目功能概览

平台主要提供以下核心功能模块：
	1.	风控事件接入
	•	支持接入各类风控事件（如注册、登录、提币等）
	•	支持事件字段结构定义与样例分析
	2.	规则管理
	•	支持规则编排、分组、优先级配置
	•	支持脚本规则（如 Groovy）、条件规则配置
	•	可视化规则启用/停用
	3.	特征管理
	•	支持自定义特征字段与计算方式（如计数器、画像、第三方 API 等）
	•	支持特征配置与特征事件绑定
	•	支持特征调用日志与调试
	4.	名单库管理
	•	黑名单、白名单、灰名单统一管理
	•	名单导入导出、批量维护
	•	名单与规则/事件联动
	5.	处置管理
	•	支持不同风控策略触发后的处置动作配置（如限制登录、冻结账户）
	•	支持多种处置方式（Webhook、人工审核、告警推送）
	6.	风控业务数据分析
	•	提供风控决策结果查询、命中规则追踪
	•	支持图表可视化分析（按事件、规则、时间维度）

🛠️ 技术栈
	•	框架：Vue 3 + Vite
	•	组件库：Element Plus / Ant Design Vue（根据实际）
	•	状态管理：Pinia
	•	网络请求：Axios
	•	可视化图表：ECharts
	•	脚本支持：Groovy 动态规则（由后端支持）

🚀 快速开始

安装依赖

npm install
# 或者
yarn install

启动开发环境

npm run dev

构建生产包

npm run build

环境配置

请在项目根目录下配置 .env.development 和 .env.production 文件，例如：

VITE_API_BASE_URL=http://localhost:8080/api

📁 项目结构说明

risk-admin-ui/
├── public/                 # 公共资源
├── src/
│   ├── assets/             # 静态资源
│   ├── components/         # 通用组件
│   ├── views/              # 页面模块（事件管理、规则管理等）
│   ├── router/             # 路由定义
│   ├── store/              # 状态管理（Pinia）
│   ├── api/                # 接口封装
│   ├── utils/              # 工具函数
│   └── main.ts             # 入口文件
├── .env.*                  # 环境变量配置
└── vite.config.ts          # 构建配置

📌 TODO（开发中）
	•	多租户支持
	•	规则模拟与回溯功能
	•	事件实时预览与调试工具
	•	支持 JSON Schema 定义事件结构
	•	多语言（i18n）支持

📄 License

本项目使用 MIT License 开源。

⸻
