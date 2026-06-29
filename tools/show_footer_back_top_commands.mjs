import { existsSync } from "node:fs";

const ROOT = existsSync("/mnt/d/.thongtaccongquangninh")
  ? "/mnt/d/.thongtaccongquangninh"
  : "D:\\.thongtaccongquangninh";

console.log(JSON.stringify({
  root: ROOT,
  workflow: "footer-backtop-live",
  defaultCommand: "npm run footer:release",
  commands: [
    {
      command: "npm run footer:release",
      legacy: "npm run release:footer-backtop-live",
      useWhen: "Mac dinh cho moi lan sua footer interaction",
    },
    {
      command: "npm run footer:dry-run",
      legacy: "npm run release:footer-backtop-dry-run",
      useWhen: "Preview workflow ma khong ghi live",
    },
    {
      command: "npm run footer:report",
      legacy: "npm run report:footer-backtop-latest",
      useWhen: "Doc nhanh report footer release moi nhat",
    },
    {
      command: "npm run footer:verify",
      legacy: "npm run verify:footer-live",
      useWhen: "Chi verify public footer khi can recheck sau cache hoac sau deploy",
    },
    {
      command: "npm run footer:postcheck",
      useWhen: "Verify public roi in ngay report footer release gan nhat",
    },
    {
      command: "npm run footer:status",
      legacy: "npm run footer:postcheck",
      useWhen: "Xem nhanh footer live hien dang on hay khong",
    },
    {
      command: "npm run footer:status-short",
      useWhen: "Lay 1 dong summary gon cho terminal, script, cron",
    },
    {
      command: "npm run footer:deploy",
      legacy: "npm run deploy:footer-backtop-live",
      useWhen: "Chi dung de debug hoac rerun rieng buoc deploy",
    },
    {
      command: "npm run footer:help",
      legacy: "npm run help:footer-backtop",
      useWhen: "Xem lai cheat sheet lenh footer",
    },
  ],
  passCriteria: {
    deploySuccess: "report success true",
    verifySuccess: "passed 7/7",
    purgeWarning: "purgeStatus=known_warning duoc chap nhan neu deploy success true va verify passed 7/7",
  },
}, null, 2));
