'use client';

interface Subtopic {
  id: string;
  name: string;
}

interface Topic {
  id: string;
  name: string;
  subtopics: Subtopic[];
}

interface TopicTreeItemProps {
  topic: Topic;
  isExpanded: boolean;
  onToggle: (topicId: string) => void;
  onToggleSubtopic: (subtopicId: string) => void;
  selectedSubtopics: Set<string>;
  searchQuery?: string;
}

export function TopicTreeItem({
  topic,
  isExpanded,
  onToggle,
  onToggleSubtopic,
  selectedSubtopics,
  searchQuery = '',
}: TopicTreeItemProps) {
  // Filter subtopics based on search query
  const filteredSubtopics = topic.subtopics.filter((subtopic) =>
    subtopic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show topic if it matches search or has matching subtopics
  const shouldShow =
    !searchQuery ||
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    filteredSubtopics.length > 0;

  if (!shouldShow) return null;

  const handleContentClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onToggle(topic.id);
  };

  const handlePinClick = (e: React.MouseEvent, subtopicId: string) => {
    e.stopPropagation();
    onToggleSubtopic(subtopicId);
  };

  return (
    <li className="tree-view-item group">
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background-dark cursor-pointer text-text-muted hover:text-white transition-colors tree-view-content ${
          isExpanded ? 'expanded' : ''
        }`}
        onClick={handleContentClick}
      >
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-primary text-base collapse-icon transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
          <span className="text-sm font-medium">{topic.name}</span>
        </div>
        <button
          className="size-6 rounded-full bg-surface-dark/50 border border-border-dark flex items-center justify-center text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="material-symbols-outlined text-sm">push_pin</span>
        </button>
      </div>
      <ul className={`pl-6 pt-1 ${isExpanded ? '' : 'hidden'} tree-view-children`}>
        {filteredSubtopics.map((subtopic) => {
          const isSelected = selectedSubtopics.has(subtopic.id);
          return (
            <li key={subtopic.id}>
              <div
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background-dark cursor-pointer text-text-muted hover:text-white transition-colors group"
                onClick={(e) => {
                  if (!(e.target as HTMLElement).closest('button')) {
                    handlePinClick(e, subtopic.id);
                  }
                }}
              >
                <span className="text-sm">{subtopic.name}</span>
                <button
                  className="size-6 rounded-full bg-surface-dark/50 border border-border-dark flex items-center justify-center text-primary text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handlePinClick(e, subtopic.id)}
                >
                  <span className="material-symbols-outlined text-sm">push_pin</span>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

