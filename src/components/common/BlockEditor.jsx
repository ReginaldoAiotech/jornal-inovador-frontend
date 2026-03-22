import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import ImageUploader from './ImageUploader';
import {
  Plus, Trash2, ChevronUp, ChevronDown, GripVertical,
  Type, Heading1, Heading2, Heading3, Image, Quote, List,
  ListOrdered, Code, Minus, Video, AlertCircle, Columns,
  FileText, Mic, Camera, LayoutTemplate,
  Bold, Italic, Underline, Strikethrough, Link as LinkIconLucide, Unlink, RemoveFormatting,
} from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Paragrafo', icon: Type, description: 'Texto normal' },
  { type: 'heading2', label: 'Titulo', icon: Heading1, description: 'Titulo de secao' },
  { type: 'heading3', label: 'Subtitulo', icon: Heading2, description: 'Subtitulo' },
  { type: 'heading4', label: 'Titulo menor', icon: Heading3, description: 'Titulo menor' },
  { type: 'image', label: 'Imagem', icon: Image, description: 'Imagem com legenda' },
  { type: 'quote', label: 'Citacao', icon: Quote, description: 'Bloco de citacao' },
  { type: 'list', label: 'Lista', icon: List, description: 'Lista com marcadores' },
  { type: 'ordered-list', label: 'Lista numerada', icon: ListOrdered, description: 'Lista ordenada' },
  { type: 'code', label: 'Codigo', icon: Code, description: 'Bloco de codigo' },
  { type: 'divider', label: 'Separador', icon: Minus, description: 'Linha divisoria' },
  { type: 'video', label: 'Video', icon: Video, description: 'Video embed (YouTube/Vimeo)' },
  { type: 'callout', label: 'Destaque', icon: AlertCircle, description: 'Caixa de destaque' },
  { type: 'two-columns', label: '2 Colunas', icon: Columns, description: 'Texto em 2 colunas' },
];

function createBlock(type) {
  const base = { id: crypto.randomUUID(), type };
  switch (type) {
    case 'paragraph': return { ...base, text: '' };
    case 'heading2': return { ...base, text: '' };
    case 'heading3': return { ...base, text: '' };
    case 'heading4': return { ...base, text: '' };
    case 'image': return { ...base, url: '', caption: '', credit: '', alt: '' };
    case 'quote': return { ...base, text: '', author: '' };
    case 'list': return { ...base, items: [''] };
    case 'ordered-list': return { ...base, items: [''] };
    case 'code': return { ...base, text: '', language: '' };
    case 'divider': return { ...base };
    case 'video': return { ...base, url: '', caption: '' };
    case 'callout': return { ...base, text: '', variant: 'info' };
    case 'two-columns': return { ...base, left: '', right: '' };
    default: return { ...base, text: '' };
  }
}

const TEMPLATES = [
  {
    id: 'noticia',
    label: 'Noticia padrao',
    icon: FileText,
    description: 'Reportagem com introducao, desenvolvimento e conclusao',
    blocks: [
      { type: 'paragraph', text: '', _placeholder: 'Paragrafo de abertura: contextualize o leitor sobre o fato principal. Responda: O que aconteceu? Quando? Onde?' },
      { type: 'heading2', text: '', _placeholder: 'Titulo da secao (ex: O que se sabe ate agora)' },
      { type: 'paragraph', text: '', _placeholder: 'Desenvolva o assunto com mais detalhes, dados e informacoes relevantes.' },
      { type: 'image', url: '', caption: '', credit: '', alt: '' },
      { type: 'paragraph', text: '', _placeholder: 'Continue o desenvolvimento da materia.' },
      { type: 'quote', text: '', author: '', _placeholder: 'Insira uma citacao de uma fonte ou entrevistado.' },
      { type: 'heading2', text: '', _placeholder: 'Titulo da proxima secao (ex: Impactos e consequencias)' },
      { type: 'paragraph', text: '', _placeholder: 'Explique os impactos, consequencias ou proximos passos.' },
      { type: 'paragraph', text: '', _placeholder: 'Paragrafo de fechamento: conclua a materia com perspectivas futuras.' },
    ],
  },
  {
    id: 'entrevista',
    label: 'Entrevista',
    icon: Mic,
    description: 'Formato pergunta e resposta com introducao',
    blocks: [
      { type: 'paragraph', text: '', _placeholder: 'Introducao: apresente o entrevistado, quem e, por que e relevante e o contexto da entrevista.' },
      { type: 'image', url: '', caption: '', credit: '', alt: '' },
      { type: 'divider' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Jornal O Inovador</strong> - Primeira pergunta ao entrevistado?' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Nome do entrevistado</strong> - Resposta do entrevistado.' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Jornal O Inovador</strong> - Segunda pergunta?' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Nome do entrevistado</strong> - Resposta.' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Jornal O Inovador</strong> - Terceira pergunta?' },
      { type: 'paragraph', text: '', _placeholder: '<strong>Nome do entrevistado</strong> - Resposta.' },
      { type: 'divider' },
      { type: 'paragraph', text: '', _placeholder: 'Texto de fechamento da entrevista.' },
    ],
  },
  {
    id: 'reportagem',
    label: 'Reportagem especial',
    icon: Camera,
    description: 'Materia longa com multiplas secoes e midias',
    blocks: [
      { type: 'paragraph', text: '', _placeholder: 'Lead forte: abra com o fato mais impactante ou uma cena que prenda a atencao do leitor.' },
      { type: 'heading2', text: '', _placeholder: 'Contexto (ex: Como tudo comecou)' },
      { type: 'paragraph', text: '', _placeholder: 'Explique o historico e o contexto do tema.' },
      { type: 'paragraph', text: '', _placeholder: 'Aprofunde com dados, numeros e estatisticas.' },
      { type: 'image', url: '', caption: '', credit: '', alt: '' },
      { type: 'heading2', text: '', _placeholder: 'Desenvolvimento (ex: Os personagens envolvidos)' },
      { type: 'paragraph', text: '', _placeholder: 'Conte a historia das pessoas envolvidas.' },
      { type: 'quote', text: '', author: '', _placeholder: 'Depoimento de um dos personagens.' },
      { type: 'paragraph', text: '', _placeholder: 'Continue o desenvolvimento da reportagem.' },
      { type: 'callout', text: '', variant: 'info', _placeholder: 'Dados importantes em destaque (ex: numeros, estatisticas relevantes).' },
      { type: 'heading2', text: '', _placeholder: 'Analise (ex: O que dizem os especialistas)' },
      { type: 'paragraph', text: '', _placeholder: 'Traga analises de especialistas no tema.' },
      { type: 'quote', text: '', author: '', _placeholder: 'Citacao de especialista.' },
      { type: 'image', url: '', caption: '', credit: '', alt: '' },
      { type: 'heading2', text: '', _placeholder: 'Conclusao (ex: O que esperar daqui pra frente)' },
      { type: 'paragraph', text: '', _placeholder: 'Feche com perspectivas, proximos passos ou o que deve acontecer.' },
      { type: 'list', items: [''], _placeholder: 'Pontos-chave da reportagem' },
    ],
  },
  {
    id: 'lista',
    label: 'Listicle (Top N)',
    icon: ListOrdered,
    description: 'Artigo em formato de lista numerada',
    blocks: [
      { type: 'paragraph', text: '', _placeholder: 'Introducao: contextualize a lista e por que ela e relevante.' },
      { type: 'heading2', text: '', _placeholder: '1. Primeiro item da lista' },
      { type: 'paragraph', text: '', _placeholder: 'Explique o primeiro item.' },
      { type: 'image', url: '', caption: '', credit: '', alt: '' },
      { type: 'heading2', text: '', _placeholder: '2. Segundo item da lista' },
      { type: 'paragraph', text: '', _placeholder: 'Explique o segundo item.' },
      { type: 'heading2', text: '', _placeholder: '3. Terceiro item da lista' },
      { type: 'paragraph', text: '', _placeholder: 'Explique o terceiro item.' },
      { type: 'divider' },
      { type: 'paragraph', text: '', _placeholder: 'Conclusao: resuma os destaques da lista.' },
    ],
  },
];

function instantiateTemplate(template) {
  return template.blocks.map((b) => ({
    ...createBlock(b.type),
    ...b,
    id: crypto.randomUUID(),
  }));
}

function blockToHtml(block) {
  switch (block.type) {
    case 'paragraph':
      return block.text ? `<p>${block.text}</p>` : '';
    case 'heading2':
      return block.text ? `<h2>${block.text}</h2>` : '';
    case 'heading3':
      return block.text ? `<h3>${block.text}</h3>` : '';
    case 'heading4':
      return block.text ? `<h4>${block.text}</h4>` : '';
    case 'image': {
      if (!block.url) return '';
      const caption = block.caption || block.credit
        ? `<figcaption>${block.caption || ''}${block.credit ? ` (${block.credit})` : ''}</figcaption>`
        : '';
      return `<figure><img src="${block.url}" alt="${block.alt || block.caption || ''}" />${caption}</figure>`;
    }
    case 'quote':
      return block.text
        ? `<blockquote><p>${block.text}</p>${block.author ? `<cite>— ${block.author}</cite>` : ''}</blockquote>`
        : '';
    case 'list':
      return block.items?.filter(Boolean).length
        ? `<ul>${block.items.filter(Boolean).map((i) => `<li>${i}</li>`).join('')}</ul>`
        : '';
    case 'ordered-list':
      return block.items?.filter(Boolean).length
        ? `<ol>${block.items.filter(Boolean).map((i) => `<li>${i}</li>`).join('')}</ol>`
        : '';
    case 'code':
      return block.text ? `<pre><code>${block.text}</code></pre>` : '';
    case 'divider':
      return '<hr />';
    case 'video': {
      if (!block.url) return '';
      const src = getEmbedUrl(block.url);
      return `<figure><div class="video-embed"><iframe src="${src}" frameborder="0" allowfullscreen></iframe></div>${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}</figure>`;
    }
    case 'callout': {
      const colors = { info: 'blue', warning: 'yellow', success: 'green', error: 'red' };
      const c = colors[block.variant] || 'blue';
      return block.text ? `<div class="callout callout-${c}" style="border-left:4px solid;padding:1rem;margin:1rem 0;border-radius:0.5rem;background:${c === 'blue' ? '#eff6ff' : c === 'yellow' ? '#fefce8' : c === 'green' ? '#f0fdf4' : '#fef2f2'}">${block.text}</div>` : '';
    }
    case 'two-columns':
      return (block.left || block.right)
        ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem"><div>${block.left || ''}</div><div>${block.right || ''}</div></div>`
        : '';
    default:
      return '';
  }
}

function getEmbedUrl(url) {
  if (!url) return '';
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function htmlToBlocks(html) {
  if (!html || !html.trim()) return [createBlock('paragraph')];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = [];

  for (const node of doc.body.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) blocks.push({ ...createBlock('paragraph'), text });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const tag = node.tagName.toLowerCase();
    switch (tag) {
      case 'p':
        blocks.push({ ...createBlock('paragraph'), text: node.innerHTML });
        break;
      case 'h2':
        blocks.push({ ...createBlock('heading2'), text: node.innerHTML });
        break;
      case 'h3':
        blocks.push({ ...createBlock('heading3'), text: node.innerHTML });
        break;
      case 'h4':
        blocks.push({ ...createBlock('heading4'), text: node.innerHTML });
        break;
      case 'blockquote': {
        const p = node.querySelector('p');
        const cite = node.querySelector('cite');
        blocks.push({
          ...createBlock('quote'),
          text: p ? p.innerHTML : node.innerHTML,
          author: cite ? cite.textContent.replace(/^—\s*/, '') : '',
        });
        break;
      }
      case 'ul':
        blocks.push({
          ...createBlock('list'),
          items: [...node.querySelectorAll('li')].map((li) => li.innerHTML),
        });
        break;
      case 'ol':
        blocks.push({
          ...createBlock('ordered-list'),
          items: [...node.querySelectorAll('li')].map((li) => li.innerHTML),
        });
        break;
      case 'figure': {
        const img = node.querySelector('img');
        const iframe = node.querySelector('iframe');
        const figcaption = node.querySelector('figcaption');
        if (img) {
          blocks.push({
            ...createBlock('image'),
            url: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || '',
            caption: figcaption ? figcaption.textContent : '',
          });
        } else if (iframe) {
          blocks.push({
            ...createBlock('video'),
            url: iframe.getAttribute('src') || '',
            caption: figcaption ? figcaption.textContent : '',
          });
        }
        break;
      }
      case 'pre':
        blocks.push({
          ...createBlock('code'),
          text: node.querySelector('code')?.textContent || node.textContent,
        });
        break;
      case 'hr':
        blocks.push(createBlock('divider'));
        break;
      case 'div': {
        if (node.className?.includes('callout')) {
          blocks.push({ ...createBlock('callout'), text: node.innerHTML });
        } else if (node.style?.gridTemplateColumns) {
          const cols = node.querySelectorAll(':scope > div');
          blocks.push({
            ...createBlock('two-columns'),
            left: cols[0]?.innerHTML || '',
            right: cols[1]?.innerHTML || '',
          });
        } else {
          blocks.push({ ...createBlock('paragraph'), text: node.innerHTML });
        }
        break;
      }
      default:
        blocks.push({ ...createBlock('paragraph'), text: node.outerHTML });
    }
  }

  return blocks.length ? blocks : [createBlock('paragraph')];
}

// --- Rich text helpers ---

function RichTextArea({ value, onChange, placeholder, rows = 3, className = '' }) {
  const editorRef = useRef(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const savedSelection = useRef(null);

  // Sync external value → contentEditable (only on mount or when value changes externally)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
      setLinkText(sel.toString());
    }
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection.current);
    }
  };

  const handleLink = () => {
    saveSelection();
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const insertLink = () => {
    restoreSelection();
    if (linkUrl.trim()) {
      if (!window.getSelection().toString() && linkText) {
        document.execCommand('insertHTML', false, `<a href="${linkUrl.trim()}" target="_blank">${linkText}</a>`);
      } else {
        document.execCommand('createLink', false, linkUrl.trim());
        // Add target blank
        const sel = window.getSelection();
        if (sel.anchorNode) {
          const anchor = sel.anchorNode.parentElement?.closest('a') || sel.anchorNode.parentElement;
          if (anchor?.tagName === 'A') {
            anchor.setAttribute('target', '_blank');
          }
        }
      }
      handleInput();
    }
    setShowLinkModal(false);
  };

  const removeLink = () => {
    execCmd('unlink');
  };

  const isActive = (cmd) => {
    try { return document.queryCommandState(cmd); } catch { return false; }
  };

  const btnClass = (cmd) => cn(
    'p-1.5 rounded transition-colors',
    isActive(cmd) ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
  );

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 mb-1 pb-1 border-b border-gray-100">
        <button type="button" onClick={() => execCmd('bold')} className={btnClass('bold')} title="Negrito (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => execCmd('italic')} className={btnClass('italic')} title="Italico (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => execCmd('underline')} className={btnClass('underline')} title="Sublinhado (Ctrl+U)">
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => execCmd('strikethrough')} className={btnClass('strikethrough')} title="Tachado">
          <Strikethrough className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" onClick={handleLink} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Inserir link">
          <LinkIconLucide className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={removeLink} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Remover link">
          <Unlink className="h-3.5 w-3.5" />
        </button>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <button type="button" onClick={() => execCmd('removeFormat')} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Limpar formatacao">
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content editable */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent overflow-y-auto',
          'prose prose-sm max-w-none prose-strong:text-gray-900',
          '[&_a]:text-primary-500 [&_a]:underline [&_a]:decoration-primary-300 [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:bg-primary-50 [&_a]:px-0.5 [&_a]:rounded [&_a]:hover:bg-primary-100 [&_a]:transition-colors',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-300 [&:empty]:before:pointer-events-none',
          className
        )}
        style={{ minHeight: `${rows * 1.5}rem` }}
        suppressContentEditableWarning
      />

      {/* Link modal */}
      {showLinkModal && (
        <div className="absolute z-30 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-80">
          <p className="text-xs font-medium text-gray-600 mb-2">Inserir link</p>
          {linkText && (
            <p className="text-xs text-gray-400 mb-2 truncate">Texto: "{linkText}"</p>
          )}
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://exemplo.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 mb-2"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertLink(); } if (e.key === 'Escape') setShowLinkModal(false); }}
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowLinkModal(false)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
            <button type="button" onClick={insertLink} className="px-3 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Inserir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Block renderers ---

function ParagraphBlock({ block, onChange }) {
  return (
    <RichTextArea
      value={block.text}
      onChange={(text) => onChange({ ...block, text })}
      placeholder={block._placeholder || 'Escreva o texto do paragrafo...'}
      rows={3}
    />
  );
}

function HeadingBlock({ block, onChange, level }) {
  const sizes = { heading2: 'text-xl font-bold', heading3: 'text-lg font-semibold', heading4: 'text-base font-semibold' };
  return (
    <input
      value={block.text}
      onChange={(e) => onChange({ ...block, text: e.target.value })}
      placeholder={block._placeholder || `Titulo ${level === 'heading2' ? 'H2' : level === 'heading3' ? 'H3' : 'H4'}...`}
      className={cn('w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent', sizes[level])}
    />
  );
}

function ImageBlock({ block, onChange }) {
  return (
    <div className="space-y-2">
      <ImageUploader
        value={block.url}
        onChange={(url) => onChange({ ...block, url })}
        compact
      />
      {block.url && (
        <div className="grid grid-cols-3 gap-2">
          <input
            value={block.caption || ''}
            onChange={(e) => onChange({ ...block, caption: e.target.value })}
            placeholder="Legenda"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <input
            value={block.credit || ''}
            onChange={(e) => onChange({ ...block, credit: e.target.value })}
            placeholder="Credito (ex: Foto: Reuters)"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <input
            value={block.alt || ''}
            onChange={(e) => onChange({ ...block, alt: e.target.value })}
            placeholder="Texto alternativo"
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
      )}
    </div>
  );
}

function QuoteBlock({ block, onChange }) {
  return (
    <div className="border-l-4 border-accent-500 pl-4 space-y-2">
      <RichTextArea
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
        placeholder={block._placeholder || 'Texto da citacao...'}
        rows={2}
        className="italic"
      />
      <input
        value={block.author || ''}
        onChange={(e) => onChange({ ...block, author: e.target.value })}
        placeholder="Autor da citacao (opcional)"
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
    </div>
  );
}

function ListBlock({ block, onChange, ordered }) {
  const addItem = () => onChange({ ...block, items: [...(block.items || []), ''] });
  const removeItem = (i) => {
    const items = block.items.filter((_, idx) => idx !== i);
    onChange({ ...block, items: items.length ? items : [''] });
  };
  const updateItem = (i, val) => {
    const items = [...block.items];
    items[i] = val;
    onChange({ ...block, items });
  };

  return (
    <div className="space-y-1.5">
      {(block.items || ['']).map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5 text-right shrink-0">
            {ordered ? `${i + 1}.` : '\u2022'}
          </span>
          <input
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={`Item ${i + 1}...`}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addItem(); }
            }}
          />
          <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-500 p-1">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs text-primary-500 hover:underline flex items-center gap-1 ml-7">
        <Plus className="h-3 w-3" /> Adicionar item
      </button>
    </div>
  );
}

function CodeBlock({ block, onChange }) {
  return (
    <div className="space-y-2">
      <input
        value={block.language || ''}
        onChange={(e) => onChange({ ...block, language: e.target.value })}
        placeholder="Linguagem (opcional: javascript, python...)"
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Cole o codigo aqui..."
        rows={5}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent resize-y"
      />
    </div>
  );
}

function VideoBlock({ block, onChange }) {
  const embedUrl = getEmbedUrl(block.url);
  return (
    <div className="space-y-2">
      <input
        value={block.url}
        onChange={(e) => onChange({ ...block, url: e.target.value })}
        placeholder="URL do video (YouTube ou Vimeo)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
      />
      {embedUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
          <iframe src={embedUrl} className="w-full h-full" frameBorder="0" allowFullScreen title="Video preview" />
        </div>
      )}
      <input
        value={block.caption || ''}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
        placeholder="Legenda do video (opcional)"
        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
    </div>
  );
}

function CalloutBlock({ block, onChange }) {
  const variants = [
    { value: 'info', label: 'Informacao', color: 'bg-blue-50 border-blue-300' },
    { value: 'warning', label: 'Atencao', color: 'bg-yellow-50 border-yellow-300' },
    { value: 'success', label: 'Sucesso', color: 'bg-green-50 border-green-300' },
    { value: 'error', label: 'Erro', color: 'bg-red-50 border-red-300' },
  ];
  const current = variants.find((v) => v.value === block.variant) || variants[0];

  return (
    <div className={cn('rounded-lg border-l-4 p-3 space-y-2', current.color)}>
      <div className="flex gap-2">
        {variants.map((v) => (
          <button
            key={v.value}
            type="button"
            onClick={() => onChange({ ...block, variant: v.value })}
            className={cn(
              'text-xs px-2 py-0.5 rounded-full border transition-colors',
              block.variant === v.value ? 'bg-white font-medium shadow-sm' : 'opacity-60 hover:opacity-100'
            )}
          >
            {v.label}
          </button>
        ))}
      </div>
      <RichTextArea
        value={block.text}
        onChange={(text) => onChange({ ...block, text })}
        placeholder={block._placeholder || 'Texto do destaque...'}
        rows={2}
        className="bg-white/80"
      />
    </div>
  );
}

function TwoColumnsBlock({ block, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <RichTextArea
        value={block.left || ''}
        onChange={(left) => onChange({ ...block, left })}
        placeholder="Coluna esquerda..."
        rows={4}
      />
      <RichTextArea
        value={block.right || ''}
        onChange={(right) => onChange({ ...block, right })}
        placeholder="Coluna direita..."
        rows={4}
      />
    </div>
  );
}

function DividerBlock() {
  return <hr className="border-gray-300 my-1" />;
}

function renderBlockEditor(block, onChange) {
  switch (block.type) {
    case 'paragraph': return <ParagraphBlock block={block} onChange={onChange} />;
    case 'heading2':
    case 'heading3':
    case 'heading4': return <HeadingBlock block={block} onChange={onChange} level={block.type} />;
    case 'image': return <ImageBlock block={block} onChange={onChange} />;
    case 'quote': return <QuoteBlock block={block} onChange={onChange} />;
    case 'list': return <ListBlock block={block} onChange={onChange} ordered={false} />;
    case 'ordered-list': return <ListBlock block={block} onChange={onChange} ordered />;
    case 'code': return <CodeBlock block={block} onChange={onChange} />;
    case 'divider': return <DividerBlock />;
    case 'video': return <VideoBlock block={block} onChange={onChange} />;
    case 'callout': return <CalloutBlock block={block} onChange={onChange} />;
    case 'two-columns': return <TwoColumnsBlock block={block} onChange={onChange} />;
    default: return <ParagraphBlock block={block} onChange={onChange} />;
  }
}

// --- Main component ---

export default function BlockEditor({ value, onChange }) {
  const [blocks, setBlocks] = useState(() => htmlToBlocks(value));
  const [showAddMenu, setShowAddMenu] = useState(null); // index to insert after
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const syncHtml = useCallback((newBlocks) => {
    setBlocks(newBlocks);
    const html = newBlocks.map(blockToHtml).filter(Boolean).join('\n');
    onChange(html);
  }, [onChange]);

  const updateBlock = (index, updated) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updated;
    syncHtml(newBlocks);
  };

  const addBlock = (type, afterIndex) => {
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, createBlock(type));
    syncHtml(newBlocks);
    setShowAddMenu(null);
  };

  const removeBlock = (index) => {
    if (blocks.length <= 1) {
      syncHtml([createBlock('paragraph')]);
      return;
    }
    syncHtml(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    syncHtml(newBlocks);
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(targetIndex, 0, moved);
    syncHtml(newBlocks);
    setDragIndex(null);
  };

  const blockMeta = (type) => BLOCK_TYPES.find((b) => b.type === type) || BLOCK_TYPES[0];

  const addBlockAtEnd = (type) => {
    addBlock(type, blocks.length - 1);
  };

  const applyTemplate = (template) => {
    const newBlocks = instantiateTemplate(template);
    syncHtml(newBlocks);
    setShowTemplates(false);
  };

  const isEmpty = blocks.length === 1 && !blocks[0].text && !blocks[0].url;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">Conteudo *</label>
        <span className="text-xs text-gray-400">{blocks.length} bloco{blocks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Template selector - show when empty */}
      {isEmpty && (
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100 p-5 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <LayoutTemplate className="h-5 w-5 text-primary-500" />
            <h3 className="text-sm font-semibold text-gray-800">Comece com um modelo</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Escolha um modelo pre-montado ou comece do zero adicionando blocos.</p>
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((tpl) => {
              const TIcon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <TIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">{tpl.label}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{tpl.description}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{tpl.blocks.length} blocos</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar - always visible */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-gray-500">Adicionar bloco:</p>
          {!isEmpty && (
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition-colors',
                showTemplates ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-primary-500'
              )}
            >
              <LayoutTemplate className="h-3 w-3" /> Modelos
            </button>
          )}
        </div>

        {/* Inline template picker */}
        {showTemplates && !isEmpty && (
          <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-200">
            {TEMPLATES.map((tpl) => {
              const TIcon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    if (confirm('Isso substituira o conteudo atual. Continuar?')) {
                      applyTemplate(tpl);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors"
                >
                  <TIcon className="h-3.5 w-3.5" />
                  {tpl.label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {BLOCK_TYPES.map((bt) => {
            const BIcon = bt.icon;
            return (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlockAtEnd(bt.type)}
                title={bt.description}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors shadow-sm"
              >
                <BIcon className="h-3.5 w-3.5" />
                {bt.label}
              </button>
            );
          })}
        </div>
      </div>

      {blocks.map((block, index) => {
        const meta = blockMeta(block.type);
        const Icon = meta.icon;

        return (
          <div key={block.id}>
            {/* Block */}
            <div
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              className={cn(
                'group relative rounded-xl border bg-white transition-all',
                dragIndex === index ? 'border-primary-300 shadow-md opacity-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              {/* Block header */}
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                <GripVertical className="h-3.5 w-3.5 text-gray-300 cursor-grab" />
                <Icon className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">{meta.label}</span>

                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveBlock(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(index, 1)}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(index)}
                    className="p-1 text-red-400 hover:text-red-500"
                    title="Remover bloco"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Block content */}
              <div className="p-3">
                {renderBlockEditor(block, (updated) => updateBlock(index, updated))}
              </div>
            </div>

            {/* Add block button between blocks */}
            <div className="flex justify-center py-1 relative">
              <button
                type="button"
                onClick={() => setShowAddMenu(showAddMenu === index ? null : index)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border transition-all',
                  showAddMenu === index
                    ? 'bg-primary-50 text-primary-600 border-primary-200 shadow-sm'
                    : 'text-gray-400 border-gray-200 bg-white hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50'
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                Inserir bloco aqui
              </button>

              {/* Add menu */}
              {showAddMenu === index && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 z-20 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-80 mt-1">
                  <p className="text-xs font-medium text-gray-500 mb-2 px-1">Escolha o tipo de bloco:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BLOCK_TYPES.map((bt) => {
                      const BIcon = bt.icon;
                      return (
                        <button
                          key={bt.type}
                          type="button"
                          onClick={() => addBlock(bt.type, index)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors text-left"
                        >
                          <BIcon className="h-4 w-4 shrink-0" />
                          <div>
                            <span className="font-medium text-xs">{bt.label}</span>
                            <p className="text-[10px] text-gray-400">{bt.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { htmlToBlocks, blockToHtml, BLOCK_TYPES };
