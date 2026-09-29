import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Contenido de artículos/servicios en markdown.
 * react-markdown convierte a React sin dangerouslySetInnerHTML y sin HTML crudo:
 * el markdown es seguro por diseño contra XSS almacenado.
 */
export function ArticleBody({ content }: { content: string }) {
  return (
    <div className="fyrama-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}