import type { Monaco } from "@monaco-editor/react";
import type { languages, Position } from "monaco-editor";
import type { editor } from "monaco-editor";

const HTML_TAGS = [
  "html",
  "head",
  "title",
  "meta",
  "link",
  "script",
  "style",
  "body",
  "header",
  "nav",
  "main",
  "section",
  "article",
  "aside",
  "footer",
  "div",
  "span",
  "p",
  "a",
  "img",
  "ul",
  "ol",
  "li",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "form",
  "input",
  "button",
  "label",
  "textarea",
  "select",
  "option",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "br",
  "hr",
  "iframe",
  "canvas",
  "svg",
  "video",
  "audio",
  "source",
  "picture",
  "figure",
  "figcaption",
  "strong",
  "em",
  "code",
  "pre",
  "blockquote",
  "details",
  "summary",
];

const JS_KEYWORDS = [
  "var",
  "let",
  "const",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "try",
  "catch",
  "finally",
  "throw",
  "new",
  "delete",
  "typeof",
  "instanceof",
  "in",
  "of",
  "await",
  "async",
  "class",
  "extends",
  "implements",
  "import",
  "export",
  "default",
  "from",
  "as",
  "interface",
  "type",
  "enum",
  "namespace",
  "declare",
  "public",
  "private",
  "protected",
  "readonly",
  "static",
  "get",
  "set",
  "yield",
  "void",
  "null",
  "undefined",
  "true",
  "false",
  "this",
  "super",
  "debugger",
];

function registerHtmlCompletions(monaco: Monaco) {
  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: ["<", "/", " "],
    provideCompletionItems(
      model: editor.ITextModel,
      position: Position
    ): languages.ProviderResult<languages.CompletionList> {
      const linePrefix = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const openTagMatch = linePrefix.match(/<(\/?)([\w-]*)$/);
      if (!openTagMatch) {
        return { suggestions: [] };
      }

      const partial = (openTagMatch[2] ?? "").toLowerCase();
      const startColumn = position.column - partial.length;

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn,
        endColumn: position.column,
      };

      const suggestions = HTML_TAGS.filter((tag) => tag.startsWith(partial)).map(
        (tag) => ({
          label: tag,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: `${tag}>$0</${tag}>`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          detail: "HTML element",
          sortText: `0_${tag}`,
        })
      );

      return { suggestions };
    },
  });
}

function registerJsCompletions(monaco: Monaco, language: string) {
  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(
      model: editor.ITextModel,
      position: Position
    ): languages.ProviderResult<languages.CompletionList> {
      const word = model.getWordUntilPosition(position);
      if (!word.word) {
        return { suggestions: [] };
      }

      const prefix = word.word.toLowerCase();
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = JS_KEYWORDS.filter((keyword) =>
        keyword.startsWith(prefix)
      ).map((keyword) => ({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range,
        detail: "keyword",
        sortText: `0_${keyword}`,
      }));

      return { suggestions };
    },
  });
}

export function registerCompletionProviders(monaco: Monaco) {
  registerHtmlCompletions(monaco);
  registerJsCompletions(monaco, "javascript");
  registerJsCompletions(monaco, "typescript");
}
