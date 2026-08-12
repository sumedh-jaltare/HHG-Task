import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

const LABEL = "गोवा";

function LetterH() {
  return (
    <div
      style={{
        display: "flex",
        width: 11,
        height: 14,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 3,
          height: 14,
          background: "#FFD000",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: 3,
          height: 14,
          background: "#FFD000",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 5.5,
          width: 11,
          height: 3,
          background: "#FFD000",
        }}
      />
    </div>
  );
}

export default async function Icon() {
  const fontData = await readFile(
    join(process.cwd(), "src/app/fonts/Baloo2-Goa.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#12332A",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
          }}
        >
          <LetterH />
          <LetterH />
        </div>
        <div
          style={{
            display: "flex",
            color: "#E63888",
            fontSize: 22,
            fontFamily: "BalooGoa",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -1,
            marginTop: 3,
          }}
        >
          {LABEL}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "BalooGoa",
          data: fontData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
