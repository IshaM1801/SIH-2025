import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "bn", label: "বাংলা" },
  { code: "sat", label: "ᱥᱟᱱᱛᱟᱲᱤ" },
  // { code: 'ur', label: 'اردو' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage || i18n.language || "en";

  const onChange = (e) => {
    const next = e.target.value;
    i18n.changeLanguage(next);
    document.documentElement.lang = next;
    if (next === "ur") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  };

  return (
    <select
      className="px-2 py-1 border rounded-md text-sm bg-white"
      value={current}
      onChange={onChange}
      aria-label="Select language"
    >
      {languages.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
