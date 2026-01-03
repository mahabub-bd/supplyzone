
FROM node:24-alpine AS builder

# কন্টেইনারের ভেতরে ওয়ার্কিং ডিরেক্টরি সেট করা
WORKDIR /app

# pnpm প্যাকেজ ম্যানেজার গ্লোবালি ইনস্টল করা
RUN npm install -g pnpm

# ডকার ক্যাশ ব্যবহার করার জন্য প্রথমে package.json এবং pnpm-lock.yaml কপি করা
# package.json পরিবর্তন না হলে ডকার এই লেয়ার ক্যাশ করবে
COPY package.json pnpm-lock.yaml ./

# ডিপেন্ডেন্সি ইনস্টল করা
# --frozen-lockfile নিশ্চিত করে যে pnpm-lock.yaml পরিবর্তন হবে না
RUN pnpm install --frozen-lockfile

# অ্যাপ্লিকেশনের বাকি সোর্স কোড কপি করা
COPY . .

# অ্যাপ্লিকেশন বিল্ড করা
RUN pnpm run build

# প্রোডাকশন ইমেজ তৈরি করা
FROM node:24-alpine AS production


WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist

# অ্যাপ্লিকেশনের জন্য ৩০০০ পোর্ট ওপেন করা
EXPOSE 3000

# ডেভেলপমেন্ট মোডে অ্যাপ্লিকেশন চালু করা
CMD ["pnpm", "run", "start:prod"]
