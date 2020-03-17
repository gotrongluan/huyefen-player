import React, { useState, useRef, useEffect } from 'react';
import { Input, Upload, Button, message } from 'antd';
import { PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined } from '@ant-design/icons';
import styles from './default.module.scss';

const minimum = (a, b) => a < b ? a : b;

const DefaultPlayer = () => {
    const videoRef = useRef(null);
    const divRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editing, setEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('https://a.udemycdn.com/2018-02-26_01-07-48-57026b79a022f2010b78262a90d2aa9c/WebHD_480.mp4?nva=20200317063607&token=0fd8ec75f50edce121543');
    const [processing, setProcessing] = useState(false);
    const [controlVisible, setControlVisible] = useState(false);
    const [timer, setTimer] = useState(null);
    const [duration, setDuration] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0)
    useEffect(() => {
        if (videoRef.current) {
            const videoEle = videoRef.current;
            videoEle.onloadstart = () => message.info('Start to load video');
            videoEle.ondurationchange = () => setDuration(videoEle.duration);
            videoEle.onloadedmetadata = () => {
                const videoHeight = videoEle.videoHeight;
                const videoWidth = videoEle.videoWidth;
                let realHeight, realWidth;
                if (videoWidth / videoHeight < 4 / 3) {
                    realHeight = 525;
                    realWidth = (525 / videoHeight) * videoWidth;
                }
                else {
                    const divEle = divRef.current;
                    const divWidth = divEle.clientWidth;
                    realWidth = divWidth;
                    realHeight = (realWidth / videoWidth) * videoHeight;
                }
                setWidth(realWidth);
                setHeight(realHeight);
            };
            videoEle.onloadeddata = () => {
                console.log(videoRef);
            }
        }
    }, [videoUrl]);
    const handleCloseChange = () => {
        setEditing(false);
        handleRemoveFile();
    };
    const handleChange = () => {
        setEditing(true);
    };
    const handleDelete = () => {

    };
    const handleBeforeUpload = (file) => {
        const fileSize = file.size;
        const fileType = file.type;
        if (fileSize > 104857600) message.error('Your video is too big.');
        else if (fileType !== 'video/mp4') message.error('Only support .mp4 video! Please replace with .mp4 video.');
        else {
            setFile(file);
            setFileName(file.name);
        }
        return false;
    };
    const handleRemoveFile = () => {
        setFile(null);
        setFileName('');
    };
    const handleUpload = () => {
        setProcessing(true);
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            const result = fileReader.result;
            setVideoUrl(null);
            setVideoUrl(result);
            handleCloseChange();
            setProcessing(false);
        };
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
                        <div className={styles.video} ref={divRef} style={{ height: height }}>
                            <video
                                ref={videoRef}
                                className={styles.videoEle}
                                width={width}
                                height={height}
                                onMouseEnter={() => {
                                    if (timer) {
                                        clearTimeout(timer);
                                        setTimer(null);
                                    };
                                    setControlVisible(true);
                                }}
                                onMouseLeave={() => {
                                    if (!timer) {
                                        const timeTimer = setTimeout(() => {
                                            setControlVisible(false);
                                            setTimer(null);
                                        }, 2000);
                                        setTimer(timeTimer);
                                    }
                                }}
                            >
                                <source src={videoUrl} type="video/mp4" />
                                Your browser does not support the video element.
                            </video>
                            {/* {pause && (
                                <div className={styles.pause}>
                                </div>
                            )} */}
                            {/* {controlVisible && (
                                <div className={styles.controlBar}>
                                    Hello
                                    <div>Current time: {currentTime || '0'}</div>
                                    <div>Duration: {duration || '0'}</div>
                                    <div>Duration: {duration || '0'}</div>
                                </div>
                            )} */}
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
                                                <span className={styles.btn} onClick={handleRemoveFile} style={{ marginLeft: '6px' }}>
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