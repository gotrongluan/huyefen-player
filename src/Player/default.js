import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { Input, Upload, Button, message, Slider, Row, Col } from 'antd';
import {
    PlayCircleFilled, UploadOutlined, LoadingOutlined, CloudUploadOutlined, DeleteOutlined, EditOutlined, DeleteFilled, CloseOutlined,
    CaretRightFilled, PauseOutlined
} from '@ant-design/icons';
import { secondsToTime } from 'utils';
import styles from './default.module.scss';

const minimum = (a, b) => a < b ? a : b;

const Video = ({ videoUrl, ...props }) => {
    const divRef = useRef(null);
    const videoRef = useRef(null);
    const [controlVisible, setControlVisible] = useState(false);
    const [duration, setDuration] = useState(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [bufferTime, setBuffertime] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [waiting, setWaiting] = useState(false);

    useEffect(() => {
        if (videoRef.current) {
            const videoEle = videoRef.current;
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
            videoEle.onloadeddata = () => setPlaying(videoEle.autoplay);
            videoEle.onprogress = () => {
                
            }
            videoEle.ontimeupdate = () => setCurrentTime(videoEle.currentTime);
            videoEle.onwaiting = () => setWaiting(true);
            videoEle.onplaying = () => setWaiting(false);
            videoEle.onplay = () => setPlaying(true);
            videoEle.onpause = () => setPlaying(false);
        }
    }, [videoUrl]);
    const handleMouseEnter = () => {
        setControlVisible(true);
    };
    const handleMouseLeave = () => {
        setControlVisible(false);
    };
    const handleTogglePlay = () => {
        const videoEle = videoRef.current;
        if (playing) videoEle.pause();
        else videoEle.play();
        setPlaying(!playing);
    }
    return (
        <div className={styles.video} ref={divRef} style={{ height: height }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <video
                {...props}
                ref={videoRef}
                className={styles.videoEle}
                width={width}
                height={height}
                onClick={handleTogglePlay}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video element.
            </video>
            {controlVisible && (
                <div className={styles.controlVisible}>
                    <Row className={styles.slider}>
                        <Slider
                            min={0}
                            max={_.ceil(duration)}
                            value={currentTime}

                        />
                    </Row>
                    <Row className={styles.options}>
                        <Col span={12} className={styles.left}>
                            <span className={styles.playStatus} onClick={handleTogglePlay}>
                                {!playing ? (
                                    <CaretRightFilled />
                                ) : (
                                    <PauseOutlined />
                                )}
                            </span>
                            <span className={styles.time}>
                                {`${secondsToTime(currentTime)} / ${secondsToTime(duration)}`}
                            </span>
                        </Col>
                        <Col span={12} className={styles.right}>

                        </Col>
                    </Row>
                </div>
            )}
        </div>
    );
};

const DefaultPlayer = () => {
    const videoRef = useRef(null);
    const divRef = useRef(null);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [editing, setEditing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('https://a2.udemycdn.com/2018-02-26_01-07-48-309e829fdec0a3aeb33169c7889af3ef/WebHD_480.mp4?nva=20200317120533&token=0e46fdf33f93078818527');
    const [processing, setProcessing] = useState(false);
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
                        <Video videoUrl={videoUrl} autoPlay/>
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