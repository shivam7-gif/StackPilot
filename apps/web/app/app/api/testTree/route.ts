import { NextResponse } from "next/server";
import directoryTree from "directory-tree";
import path from "path";
import { PROJECTS_DIR} from "./project.service.js";

export async function GET() {
  try {
    const testPath = path.join(
      process.cwd(),
      "..",
      "..",
      PROJECTS_DIR
    );

    console.log("Reading path:", testPath);

    const tree = directoryTree(testPath);

    return NextResponse.json(tree);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to generate tree",
      },
      { status: 500 }
    );
  }
}