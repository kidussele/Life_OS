import { NextResponse } from "next/server";
import { exportDatabaseBackup } from "@/lib/resetService";

export async function GET() {
  try {
    const backup = await exportDatabaseBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `life_os_backup_${timestamp}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
