
# ----------------- Stage 1: Build -----------------
FROM node:24-alpine AS builder

# pnpm ইনস্টল করা
RUN npm install -g pnpm

WORKDIR /app

# pnpm-lock.yaml ফাইল কপি করা
COPY package.json pnpm-lock.yaml ./

# ডিপেনডেন্সি ইনস্টল করা (--frozen-lockfile ব্যবহার করলে লক ফাইল আপডেট হবে না)
RUN pnpm install --frozen-lockfile

# বাকি সোর্স কোড কপি করা
COPY . .

# অ্যাপটি বিল্ড করা
RUN pnpm build

# ----------------- Stage 2: Production -----------------
FROM nginx:alpine


# বিল্ডার স্টেজ থেকে dist ফোল্ডার কপি করা
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

 