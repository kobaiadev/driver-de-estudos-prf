import { describe, expect, it } from "vitest";
import { distribuirHoras } from "./plano";

describe("distribuirHoras", () => {
  it("20h/semana: 4h de questões e 2h de revisão", () => {
    const r = distribuirHoras(20);
    expect(r.questoes).toBe(4);
    expect(r.revisao).toBe(2);
  });
  it("Trânsito recebe mais horas que Ética", () => {
    const r = distribuirHoras(20);
    expect(r.porMateria["transito"]!).toBeGreaterThan(r.porMateria["etica"]!);
  });
});
