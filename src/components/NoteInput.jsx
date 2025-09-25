import { useState } from 'react';

const users = [
  { id: 1, name: 'SandraMarx' },
  { id: 2, name: 'JohnDoe' },
  { id: 3, name: 'JaneSmith' },
];

const NoteInput = ({ onSubmit, isSaving }) => {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    const lastWord = value.split(/(\s+)/).pop();
    if (lastWord.startsWith('@')) {
      const searchTerm = lastWord.substring(1).toLowerCase();
      const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm)
      );
      setSuggestions(filteredUsers);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (name) => {
    const words = text.split(' ');
    words.pop();
    setText(words.join(' ') + ` @${name} `);
    setSuggestions([]);
  };

  const handleSave = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <div className='relative'>
      <textarea
        className='w-full bg-secondary border border-border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none'
        rows='4'
        placeholder='Add a note... use @ to mention someone'
        value={text}
        onChange={handleChange}
      ></textarea>
      {suggestions.length > 0 && (
        <ul className='absolute bottom-full left-0 mb-2 w-full bg-secondary border border-border rounded-lg shadow-lg z-10'>
          {suggestions.map((user) => (
            <li
              key={user.id}
              className='p-2 hover:bg-blue cursor-pointer'
              onClick={() => handleSuggestionClick(user.name)}
            >
              {user.name}
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !text.trim()}
          className="py-2 mt-2 px-5 rounded-lg cursor-pointer bg-grey text-background font-semibold hover:bg-dark-grey disabled:bg-primary/50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
};

export default NoteInput;