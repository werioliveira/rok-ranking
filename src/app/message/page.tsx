'use client'
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Sword, Users, AlertTriangle, Crown } from "lucide-react";

export default function MessageEditor() {
  const [message, setMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFD700");
  const [fontSize, setFontSize] = useState(14);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Templates without emojis
  const templates = [
    {
      id: "war",
      name: "War Call",
      icon: Sword,
      content: `<color=#FF0000>WAR CALL</color>

<color=#FFFF00>Warriors of the Kingdom!</color>

<color=#FFFFFF>It’s time to march! Our enemies have challenged us, and we will respond with full force!

Date: [INSERT DATE]
Time: [INSERT TIME]
Target: [INSERT TARGET]

<color=#00FF00>Prepare your troops!</color>
For the glory of the kingdom!</color>`,
    },
    {
      id: "recruit",
      name: "Recruitment",
      icon: Users,
      content: `<color=#00FF00>RECRUITMENT OPEN</color>

<color=#FFFF00>Join our glorious alliance!</color>

<color=#FFFFFF>We are looking for dedicated warriors:
• Minimum Power: [INSERT POWER]
• T4+ Kills: [INSERT KILLS]
• Active in wars and events

<color=#0099FF>Benefits:</color>
Safe territory
Constant support
Winning strategies

Apply now!</color>`,
    },
    {
      id: "alert",
      name: "Attack Alert",
      icon: AlertTriangle,
      content: `<color=#FF0000>MAX ALERT</color>

<color=#FFFF00>IMMINENT ATTACK!</color>

<color=#FFFFFF>Coordinates: X:[___] Y:[___]
Estimated time: [___] minutes

<color=#FF9900>ACTIONS REQUIRED:</color>
1. Activate shield/teleport
2. Protect troops in shelter
3. Send resources to allies

<color=#FF0000>STAY CALM AND FOLLOW PROTOCOL!</color>`,
    },
    {
      id: "event",
      name: "Kingdom Event",
      icon: Crown,
      content: `<color=#CC00FF>SPECIAL EVENT</color>

<color=#FFFF00>[EVENT NAME]</color>

<color=#FFFFFF>Start: [DATE/TIME]
Duration: [DURATION]

<color=#00FFFF>Main objectives:</color>
• [OBJECTIVE 1]
• [OBJECTIVE 2]
• [OBJECTIVE 3]

<color=#00FF00>Rewards:</color>
[List rewards]

Let’s dominate this event!</color>`,
    },
  ];

    const wrapOrReplaceTag = (tag: "color" | "b" | "i" | "size", value?: string) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    let selected = message.slice(start, end);

    const openTag = tag === "color" ? `<color=${value}>` :
                    tag === "size" ? `<size=${value}>` :
                    tag === "b" ? "<b>" : "<i>";
    const closeTag = tag === "color" || tag === "size" ? `</${tag}>` : tag === "b" ? "</b>" : "</i>";

    // Regex para detectar tag existente ao redor da seleção
    const regex = tag === "color" ? new RegExp(`^<color=#[A-Fa-f0-9]{6}>([\\s\\S]*)</color>$`) :
                    tag === "size" ? new RegExp(`^<size=\\d+>([\\s\\S]*)</size>$`) :
                    tag === "b" ? /^<b>([\s\S]*)<\/b>$/ :
                    /^<i>([\s\S]*)<\/i>$/;

    const match = selected.match(regex);

    if (match) {
        // Substituir valor da tag, mantendo o conteúdo
        selected = match[1]; 
    }

    const newText = message.slice(0, start) + openTag + selected + closeTag + message.slice(end);
    setMessage(newText);

    setTimeout(() => {
        ta.focus();
        const pos = start + openTag.length + selected.length + closeTag.length;
        ta.setSelectionRange(pos, pos);
    }, 0);
    };

const insertColor = () => wrapOrReplaceTag("color", selectedColor);
const makeBold = () => wrapOrReplaceTag("b");
const makeItalic = () => wrapOrReplaceTag("i");
const setSize = (size: number) => wrapOrReplaceTag("size", size.toString());

  const applyTemplate = (template: typeof templates[0]) => {
    setMessage(template.content);
    setSelectedTemplate(template.id);
    toast.success(`Template "${template.name}" applied!`);
  };

  const clearMessage = () => {
    setMessage("");
    setSelectedTemplate(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied!");
  };

  const renderPreview = () => {
    let preview = message;
    preview = preview.replace(/<color=(#[A-Fa-f0-9]{6})>/g, '<span style="color:$1">');
    preview = preview.replace(/<\/color>/g, '</span>');
    preview = preview.replace(/<b>/g, '<strong>');
    preview = preview.replace(/<\/b>/g, '</strong>');
    preview = preview.replace(/<i>/g, '<em>');
    preview = preview.replace(/<\/i>/g, '</em>');
    preview = preview.replace(/<size=(\d+)>/g, '<span style="font-size:$1px">');
    preview = preview.replace(/<\/size>/g, '</span>');
    preview = preview.replace(/\n/g, '<br />');
    return { __html: preview };
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 min-h-screen p-4">
      {/* Editor */}
      <div className="space-y-4">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-primary mb-2">RoK Message Editor</h2>

          {/* Templates */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {templates.map((t) => {
              const Icon = t.icon;
              return (
                <Button
                  key={t.id}
                  variant={selectedTemplate === t.id ? "default" : "secondary"}
                  onClick={() => applyTemplate(t)}
                  className="justify-start gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {t.name}
                </Button>
              );
            })}
          </div>

          {/* Text formatting */}
          <div className="flex gap-2 flex-wrap mb-2">
            <Button size="sm" onClick={makeBold}>Bold</Button>
            <Button size="sm" onClick={makeItalic}>Italic</Button>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="border rounded px-2 text-black"
            >
              {[12,14,16,18,20,24,28,30,32,34,36,38,40,50,60,70,80].map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
            <Button size="sm" onClick={() => setSize(fontSize)}>Set Size</Button>
          </div>

          {/* Universal color picker */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-12 h-8 border rounded cursor-pointer"
            />
            <Button size="sm" onClick={insertColor}>Apply Color</Button>
            <span className="ml-2 text-sm">Current: {selectedColor}</span>
          </div>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[300px] font-mono text-sm bg-background"
            placeholder="Type your message here..."
          />

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Button onClick={copyToClipboard} className="flex-1">Copy</Button>
            <Button onClick={clearMessage} variant="secondary">Clear</Button>
          </div>
        </Card>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-primary mb-2">Preview</h2>
          <div className="min-h-[400px] p-4 bg-[#FCE7C4] rounded-lg border border-border">
            <div dangerouslySetInnerHTML={renderPreview()} />
          </div>
        </Card>
      </div>
    </div>
  );
}
