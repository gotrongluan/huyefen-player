import React, { useState } from 'react';
import { Input, Upload, Button, message } from 'antd';
import { PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined } from '@ant-design/icons';
import styles from './default.module.scss';

const DefaultPlayer = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editing, setEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('s');
    const [processing, setProcessing] = useState(false);
    const handleCloseChange = () => {

    };
    const handleChange = () => {

    };
    const handleDelete = () => {

    };
    const handleBeforeUpload = () => {

    };
    const handleRemoveFile = () => {

    };
    const handleUpload = () => {

    };
    const uploadProps = {
        accept: 'video/mp4',
        name: 'videoFile',
        beforeUpload: handleBeforeUpload,
        openFileDialogOnClick: !file,
        showUploadList: false
    };
    return (
        <div className={styles.defaultPlayer}>
            <div className={styles.title}>Default Player</div>
            <div className={styles.main}>
                {videoUrl && (
                    <div className={styles.videoAndBtns}>
                        <div className={styles.video}>

                        </div>
                        <div className={styles.btns}>
                            {editing ? (
                                <Button onClick={handleCloseChange}>
                                    <CloseOutlined /> Close
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={handleChange}>
                                        <EditOutlined /> Replace
                                    </Button>
                                    <Button onClick={handleDelete} style={{ marginLeft: '12px' }}>
                                        <DeleteOutlined /> Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {(!videoUrl || editing) && (
                    <div className={styles.uploader}>
                        <div className={styles.warning}>
                            HuYeFen player only suport .mp4 video file. The video must less than 100MB.
                        </div>
                        <div className={styles.upload}>
                            <Input
                                disabled={processing}
                                value={fileName}
                                placeholder="No file selected."
                                addonBefore={(
                                    <span className={styles.addOnBefore}>
                                        <PlayCircleFilled style={{ color: '#090199', position: 'relative', top: '1px' }} />
                                        <span className={styles.text}>Video file:</span>
                                    </span>
                                )}
                                size="large"
                                addonAfter={(
                                    <span className={styles.addOnAfter}>
                                        {!file ? (
                                            <Upload {...uploadProps}>
                                                <span className={styles.btn}>
                                                    <UploadOutlined />
                                                </span>
                                            </Upload>
                                        ) : processing ? (
                                            <LoadingOutlined spin />
                                        ) : (
                                            <span>
                                                <span className={styles.btn} onClick={handleUpload}>
                                                    <CloudUploadOutlined />
                                                </span>
                                                <span className={styles.btn} onClick={handleRemoveFile}>
                                                    <DeleteOutlined />
                                                </span>
                                            </span>
                                        )}
                                    </span>
                                )}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default DefaultPlayer;