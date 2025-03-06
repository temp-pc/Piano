export const PROJECT_NAME = "Piano";
export const NOTE_CHAR_LIST = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
export const BASE_NOTE = {
  "C": 0, "Cs": 1, "D": 2, "Ds": 3, "E": 4, "F": 5, "Fs": 6,
  "G": 7, "Gs": 8, "A": 9, "As": 10, "B": 11
};
export const MAJOR_SCALE_NOTE_LIST = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE_NOTE_LIST = [0, 2, 3, 5, 7, 8, 10];
export const CHORD_PATTERNS = {
  "I": [0, 4, 7],
  "IIm": [2, 5, 9],
  "IIIm": [4, 7, 11],
  "IV": [5, 9, 0],
  "V": [7, 11, 2],
  "VIm": [9, 0, 4],
  "VIIdim": [11, 2, 5],
  "Im": [0, 3, 7],
  "IIdim": [2, 5, 8],
  "IIIb": [3, 7, 10],
  "IVm": [5, 8, 0],
  "Vm": [7, 10, 2],
  "VIb": [8, 0, 3],
  "VIIb": [10, 2, 5],
}; 