'use client';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { hideAlert } from '@/redux/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function Alert() {
  const dispatch = useDispatch();
  const alert = useSelector((state: RootState) => state.game.alert);

  if (!alert.show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-200 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Alert Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{alert.header}</h2>
            <button
              type="button"
              onClick={() => dispatch(hideAlert())}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-white text-xl hover:text-gray-500"
              />
            </button>
          </div>
        </div>
        
        {/* Alert Body */}
        <div className="p-6">
          <div className="text-slate-700">
            {typeof alert.body === 'string' ? (
              <p>{alert.body}</p>
            ) : (
              alert.body
            )}
          </div>
        </div>
        
        {/* Alert Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={() => dispatch(hideAlert())}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
