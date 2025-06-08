# 阶段 1：使用 Node 构建 Vue3 项目
FROM node:18 AS build

# 构建环境变量
ARG ENVIRONMENT=production

# 工作目录
WORKDIR /app

# 复制依赖文件并安装依赖
COPY package*.json ./
RUN npm install

# 复制所有源代码
COPY . .

# 根据构建参数拷贝环境配置
RUN if [ "$ENVIRONMENT" = "development" ]; then \
        cp .env.development .env; \
    else \
        cp .env.production .env; \
    fi

# 构建前端资源
RUN npm run build:prod

# 阶段 2：使用 nginx 运行静态站点
FROM nginx:alpine

# 拷贝打包文件到 nginx 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 拷贝 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]