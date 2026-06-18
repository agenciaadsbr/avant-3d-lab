import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["xlsx", "@prisma/adapter-libsql", "@libsql/client"],
};

export default nextConfig;
