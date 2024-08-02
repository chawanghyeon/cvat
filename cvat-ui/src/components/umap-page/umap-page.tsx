/* eslint-disable @typescript-eslint/dot-notation */
import React, { useEffect, useRef, useState } from 'react';
import './styles.scss';
import { Scatter, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { useDispatch, useSelector } from 'react-redux';
import { getUmap, getLabels } from 'actions/organization-actions';
import { CombinedState } from 'reducers';
import { getCore } from 'cvat-core-wrapper';
import JSZip from 'jszip';

const core = getCore();
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function UmapPageComponent(): JSX.Element {
    const dispatch = useDispatch();
    const chartRef = useRef();
    // const [selectedLabel, setSelectedLabel] = useState<string>('');
    const organization_slug = useSelector((state: CombinedState) => state.organizations.current?.slug);
    const { isOpen, modalType, modalProps } = useSelector((state: any) => state.modal);

    const labels = useSelector((state: CombinedState) => state.organizations.labels);
    const umap = useSelector((state: CombinedState) => state.organizations.umap);
    const [data, setData] = useState<any>({
        datasets: [
            {
                label: 'A dataset',
                data: Array.from({ length: 0 }, () => ({})),
                backgroundColor: 'rgba(255, 99, 132, 1)',
            },
        ],
    });

    useEffect(() => {
        dispatch(getLabels(organization_slug));
    }, [organization_slug]);

    useEffect(() => {
        if (modalProps?.label === '') {
            return;
        }
        console.log('modalProps?.label : ', modalProps);
        dispatch(getUmap(modalProps?.label));
    }, [modalProps]);

    useEffect(() => {
        if (umap?.tx && umap?.ty && umap?.annotations) {
            const data = {
                labels: Array.from({ length: umap?.tx.length }, (v, k) => umap?.annotations[k][0]),
                datasets: [
                    {
                        label: umap.label,
                        data: Array.from({ length: umap?.tx.length }, (v, k) => ({
                            x: umap.tx[k],
                            y: umap.ty[k],
                        })),
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                    },
                ],
            };
            setData(data);
        }
    }, [umap]);

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    // const handleSelectChange = (event) => {
    //   setSelectedLabel(event.target.value);
    // };

    const onClick = async (event: React.MouseEvent<HTMLCanvasElement, globalThis.MouseEvent>) => {
        const chart = chartRef.current;
        if (!chart) return;

        const index = getElementAtEvent(chart, event)[0]?.index;
        if (!index || !umap?.annotations) return;

        let modal: any = document.getElementById('myModal');
        let modalImg: any = document.getElementById('img01');
        let span: any = document.getElementsByClassName('close')[0];

        if (!modal || !modalImg || !span) return;
        span.addEventListener('click', function () {
            modal.style.display = 'none';
        });

        const image = await core.frames.getData(null, umap?.annotations[index][2], umap?.annotations[index][1]);

        const zip: any = new JSZip();

        zip.loadAsync(image)
            .then((zip: any) => {
                zip.forEach((relativePath: any, file: any) => {
                    zip.file(relativePath)
                        .async('blob')
                        .then((fileData: any) => {
                            const url = URL.createObjectURL(fileData);
                            modal.style.display = 'flex';
                            modalImg.src = url;
                        });
                });
            })
            .catch((error: any) => {
                console.error('Error decompressing or loading image:', error);
            });
    };

    return (
        <div>
            <div
                style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '2px',
                }}
            >
                {modalProps.label}
            </div>
            <Scatter id='graph' ref={chartRef} options={options} data={data} onClick={onClick} />
            {/* <select value={selectedLabel} onChange={handleSelectChange}>
            <option value="">Select an option</option>
            {labels?.results.map(option => (
              <option key={option.id} value={option.id}>{option.id + '_' + option.name}</option>
            ))}
          </select> */}
            <div id='myModal' className='modal'>
                <span className='close'>&times;</span>
                <img
                    className='modal-content'
                    id='img01'
                    style={{ width: '70%', justifyContent: 'center', alignItems: 'center' }}
                />
            </div>
        </div>
    );
}
