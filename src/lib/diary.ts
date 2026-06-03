/**
 * Baby photo diary — one optional photo per stage (gestational week or
 * postpartum month), keyed by the unified stage value (4–65). Stored locally
 * as compressed data URLs; nothing leaves the browser.
 */
export interface DiaryEntry {
  /** compressed image data URL */
  url: string;
  /** when the photo was added (epoch ms) */
  at: number;
  /** optional short note */
  caption?: string;
}

export type Diary = Record<number, DiaryEntry>;
