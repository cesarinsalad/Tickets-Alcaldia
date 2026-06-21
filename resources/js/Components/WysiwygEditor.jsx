import { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const modules = {
    toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'blockquote'],
        ['clean'],
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link', 'blockquote',
];

export default function WysiwygEditor({ value, onChange }) {
    const quillRef = useRef(null);

    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            editor.root.style.minHeight = '300px';
        }
    }, []);

    return (
        <div className="wysiwyg-editor">
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder="Escribe el contenido del artículo..."
            />
        </div>
    );
}
