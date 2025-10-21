import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { ToolIcon, TrashIcon } from '../../assets/icons';

const ToolCard = ({ tool, onDelete }) => {
    // This is a safeguard. If for some reason the tool is not passed correctly,
    // it will prevent the app from crashing.
    if (!tool) {
        return null; 
    }

    // Extract just the filename from the full path sent by the backend
    const fileName = tool.file_path ? tool.file_path.split(/[\\/]/).pop() : 'No file path';

    return (
        <Card>
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex-shrink-0">
                        <ToolIcon className="h-10 w-10 text-indigo-400" />
                    </div>
                    <Button
                        onClick={onDelete}
                        variant="danger"
                        className="p-1 h-8 w-8 ml-2"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-4">
                    <h5 className="text-lg font-bold text-white truncate" title={tool.name}>
                        {tool.name || 'Unnamed Tool'}
                    </h5>
                    <p className="text-sm text-gray-400 truncate" title={fileName}>
                        {fileName}
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default ToolCard;