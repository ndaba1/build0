"use client";

import { documentTypeDefs } from "@/app/(editor)/editor/[id]/definitions";
import { cn } from "@/lib/utils";
import { Editor } from "@monaco-editor/react";
import Monaco from "monaco-editor/esm/vs/editor/editor.api";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

export const defaultInitialCode = `\
/**
 * Define your PDF template here.
 */ 
function generate(variables: Variables) {
  return {
    content: [
      { text: 'Hello, World!', fontSize: 24 }
    ]
  } satisfies TDocumentDefinitions;
}`;

export function useTsEditor({
  initialCode = defaultInitialCode,
  generatePdf,
}: {
  initialCode?: string;
  generatePdf?: (docDefinition: TDocumentDefinitions) => void;
} = {}) {
  const generatePdfRef = useRef(generatePdf);
  const [tsCode, setTsCode] = useState(initialCode);
  const [debouncedCode] = useDebounce(tsCode, 600);
  const [monaco, setMonaco] = useState<typeof Monaco | null>(null);
  const [editor, setEditor] =
    useState<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const [jsCode, setJsCode] = useState<string | null>(null);

  // Define custom types and inject them into Monaco's environment
  function onMount(
    editor: Monaco.editor.IStandaloneCodeEditor,
    monaco: typeof Monaco
  ) {
    setEditor(editor);
    setMonaco(monaco);

    // Add custom type definitions
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      ${documentTypeDefs}
      interface Variables {};
      `
    );
  }

  useEffect(() => {
    if (!monaco || !editor) return;

    async function compile() {
      const model = editor?.getModel();
      if (!monaco || !editor || !model) return;

      const worker = await monaco.languages.typescript.getTypeScriptWorker();
      const proxy = await worker(model.uri);
      const output = await proxy.getEmitOutput(model.uri.toString());
      const outputCode = output.outputFiles[0].text;

      console.log(outputCode);

      setJsCode(outputCode);

      if (generatePdfRef.current) {
        // TODO: move away from eval for security reasons
        const generateFunc = eval(outputCode + "; generate");

        if (typeof generateFunc === "function") {
          const docDefinition = generateFunc({});
          generatePdfRef.current(docDefinition);
        }
      }
    }

    compile();
  }, [debouncedCode, monaco, editor]);

  return {
    tsCode,
    setTsCode,
    jsCode,
    setJsCode,
    onMount,
    monaco,
    editor,
  };
}

export function TSEditor(props: React.ComponentProps<typeof Editor>) {
  return (
    <Editor
      {...props}
      language="typescript"
      options={{
        ...props.options,
        minimap: { enabled: false },
        fontSize: 16,
      }}
    />
  );
}

export function JsonEditor(props: React.ComponentProps<typeof Editor>) {
  return (
    <Editor
      width="100%"
      height={300}
      {...props}
      className={cn("border shadow", props.className)}
      language="json"
      options={{
        codeLens: false,
        fontFamily: "Menlo, Consolas, monospace, sans-serif",
        quickSuggestions: false,
        renderValidationDecorations: "off",
        minimap: { enabled: false },
        fontSize: 14,
        folding: true,
        wordWrap: "on",
        tabSize: 2,
        glyphMargin: false,
        lineDecorationsWidth: 4,
        lineNumbersMinChars: 2,
        lineNumbers: "on",
        ...props.options,
      }}
    />
  );
}
