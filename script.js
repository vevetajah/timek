document.addEventListener('DOMContentLoaded', function() {
            const weatherData = {};
            let activeWeather = null;
            const times = ['Midnight', '5AM', '6AM', '7AM', 'Midday', '7PM', '8PM', '10PM'];
            
            const weatherTabs = document.getElementById('weather-tabs');
            const weatherContainer = document.getElementById('weather-container');
            const addWeatherBtn = document.getElementById('add-weather');
            const weatherModal = document.getElementById('weather-modal');
            const weatherSelect = document.getElementById('weather-select');
            const confirmWeatherBtn = document.getElementById('confirm-weather');
            const cancelWeatherBtn = document.getElementById('cancel-weather');
            const previewBtn = document.getElementById('preview-btn');
            const downloadBtn = document.getElementById('download-btn');
            const resetBtn = document.getElementById('reset-btn');
            const previewModal = document.getElementById('preview-modal');
            const closePreviewBtn = document.getElementById('close-preview');
            const previewContent = document.getElementById('preview-content');
            const downloadFromPreviewBtn = document.getElementById('download-from-preview');
            const creatorNameInput = document.getElementById('creator-name');
            const timecycNameInput = document.getElementById('timecyc-name');
            
            function initWeatherData(weatherType) {
                const defaultValues = {
                    Amb: { r: 0, g: 0, b: 0 },
                    Amb_Obj: { r: 0, g: 0, b: 0 },
                    Dir: { r: 0, g: 0, b: 0 },
                    Sky_top: { r: 0, g: 0, b: 0 },
                    Sky_bot: { r: 0, g: 0, b: 0 },
                    SunCore: { r: 0, g: 0, b: 0 },
                    SunCorona: { r: 0, g: 0, b: 0 },
                    SunSz: 0.0,
                    SprSz: 0.0,
                    SprBght: 1.0,
                    Shdw: 0,
                    LightShd: 0,
                    PoleShd: 0,
                    FarClp: 0.0,
                    FogSt: 0.0,
                    LightOnGround: 0.0,
                    LowCloudsRGB: { r: 0, g: 0, b: 0 },
                    BottomCloudRGB: { r: 0, g: 0, b: 0 },
                    WaterRGBA: { r: 0, g: 0, b: 0, a: 0 },
                    Alpha1: 0,
                    RGB1: { r: 0, g: 0, b: 0 },
                    Alpha2: 0,
                    RGB2: { r: 0, g: 0, b: 0 },
                    CloudAlpha: 0,
                    HighlightMinIntensity: 0,
                    WaterFogAlpha: 0,
                    Illumination: 0.0
                };
                
                weatherData[weatherType] = {};
                times.forEach(time => {
                    weatherData[weatherType][time] = JSON.parse(JSON.stringify(defaultValues));
                });
            }
            
            function createWeatherTab(weatherType) {
                const tab = document.createElement('div');
                tab.className = 'weather-tab px-4 py-2 rounded-lg border bg-white draggable-weather';
                tab.textContent = weatherType;
                tab.dataset.weather = weatherType;
                
                const closeBtn = document.createElement('span');
                closeBtn.className = 'ml-2 text-gray-400 hover:text-red-500';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteWeather(weatherType);
                });
                tab.appendChild(closeBtn);
                
                tab.addEventListener('click', function() {
                    setActiveWeather(weatherType);
                });
                
                return tab;
            }

            function setActiveWeather(weatherType) {

                document.querySelectorAll('.weather-tab').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.weather === weatherType) {
                        tab.classList.add('active');
                    }
                });
                
                activeWeather = weatherType;
                renderWeatherForm(weatherType);
            }

            function deleteWeather(weatherType) {
                if (confirm(`Are you sure you want to delete ${weatherType}?`)) {
                    delete weatherData[weatherType];

                    document.querySelector(`.weather-tab[data-weather="${weatherType}"]`).remove();

                    if (activeWeather === weatherType) {
                        const remainingTabs = document.querySelectorAll('.weather-tab');
                        if (remainingTabs.length > 0) {
                            setActiveWeather(remainingTabs[0].dataset.weather);
                        } else {
                            activeWeather = null;
                            weatherContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Select or add a weather type to configure</p>';
                        }
                    }
                }
            }

            function renderWeatherForm(weatherType) {
                weatherContainer.innerHTML = '';
                
                const heading = document.createElement('h3');
                heading.className = 'text-xl font-semibold mb-4';
                heading.textContent = `Configure ${weatherType}`;
                weatherContainer.appendChild(heading);

                const timeTabsContainer = document.createElement('div');
                timeTabsContainer.className = 'flex flex-wrap gap-2 mb-4';
                
                times.forEach(time => {
                    const timeTab = document.createElement('div');
                    timeTab.className = 'weather-tab px-3 py-1 rounded-lg border bg-white draggable-time';
                    timeTab.textContent = time;
                    timeTab.dataset.time = time;
                    
                    timeTab.addEventListener('click', function() {
                        setActiveTime(time);
                    });
                    
                    timeTabsContainer.appendChild(timeTab);
                });
                
                weatherContainer.appendChild(timeTabsContainer);

                const timeSectionsContainer = document.createElement('div');
                timeSectionsContainer.id = 'time-sections-container';
                weatherContainer.appendChild(timeSectionsContainer);

                setActiveTime(times[0]);
            }

            function setActiveTime(time) {
                const container = document.getElementById('time-sections-container');
                if (!container) return;

                container.parentElement.querySelectorAll('.weather-tab').forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.dataset.time === time) {
                        tab.classList.add('active');
                    }
                });

                renderTimeForm(activeWeather, time);
            }

            function createValidatedInput(type, value, min, max, step, required = true) {
                const input = document.createElement('input');
                input.type = type;
                input.className = 'number-input px-3 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
                input.value = value;
                
                if (min !== undefined) input.min = min;
                if (max !== undefined) input.max = max;
                if (step !== undefined) input.step = step;
                input.required = required;

                const errorSpan = document.createElement('span');
                errorSpan.className = 'input-error';
                errorSpan.textContent = `Must be between ${min} and ${max}`;
                
                input.addEventListener('input', function() {
                    if (this.validity.rangeUnderflow || this.validity.rangeOverflow) {
                        this.nextElementSibling.style.display = 'block';
                    } else {
                        this.nextElementSibling.style.display = 'none';
                    }
                });
                
                return { input, errorSpan };
            }

            function renderTimeForm(weatherType, time) {
                const container = document.getElementById('time-sections-container');
                container.innerHTML = '';
                
                const timeData = weatherData[weatherType][time];

                const sections = [
                    {
                        title: 'Ambient Colors',
                        fields: [
                            { label: 'Amb (RGB)', type: 'color', key: 'Amb' },
                            { label: 'Amb_Obj (RGB)', type: 'color', key: 'Amb_Obj' },
                            { label: 'Dir (RGB)', type: 'color', key: 'Dir' }
                        ]
                    },
                    {
                        title: 'Sky Colors',
                        fields: [
                            { label: 'Sky top (RGB)', type: 'color', key: 'Sky_top' },
                            { label: 'Sky bot (RGB)', type: 'color', key: 'Sky_bot' }
                        ]
                    },
                    {
                        title: 'Sun Settings',
                        fields: [
                            { label: 'SunCore (RGB)', type: 'color', key: 'SunCore' },
                            { label: 'SunCorona (RGB)', type: 'color', key: 'SunCorona' },
                            { label: 'SunSz (0.0-10.0)', type: 'number', key: 'SunSz', min: 0, max: 10, step: 0.1 },
                            { label: 'SprSz', type: 'number', key: 'SprSz', min: 0, max: 10, step: 0.1 },
                            { label: 'SprBght', type: 'number', key: 'SprBght', min: 0, max: 10, step: 0.1 }
                        ]
                    },
                    {
                        title: 'Shadow Settings',
                        fields: [
                            { label: 'Shdw (0-255)', type: 'number', key: 'Shdw', min: 0, max: 255 },
                            { label: 'LightShd', type: 'number', key: 'LightShd', min: 0, max: 255 },
                            { label: 'PoleShd', type: 'number', key: 'PoleShd', min: 0, max: 255 }
                        ]
                    },
                    {
                        title: 'Environment Settings',
                        fields: [
                            { label: 'FarClp', type: 'number', key: 'FarClp', min: 0, max: 1000, step: 0.1 },
                            { label: 'FogSt (-50-50)', type: 'number', key: 'FogSt', min: -50, max: 50, step: 0.1 },
                            { label: 'LightOnGround', type: 'number', key: 'LightOnGround', min: 0, max: 10, step: 0.1 }
                        ]
                    },
                    {
                        title: 'Cloud Settings',
                        fields: [
                            { label: 'LowCloudsRGB (RGB)', type: 'color', key: 'LowCloudsRGB' },
                            { label: 'BottomCloudRGB (RGB)', type: 'color', key: 'BottomCloudRGB' },
                            { label: 'CloudAlpha', type: 'number', key: 'CloudAlpha', min: 0, max: 255 }
                        ]
                    },
                    {
                        title: 'Water Settings',
                        fields: [
                            { label: 'WaterRGBA (RGBA)', type: 'color', key: 'WaterRGBA', hasAlpha: true },
                            { label: 'WaterFogAlpha', type: 'number', key: 'WaterFogAlpha', min: 0, max: 255 }
                        ]
                    },
                    {
                        title: 'Additional Colors',
                        fields: [
                            { label: 'Alpha1', type: 'number', key: 'Alpha1', min: 0, max: 255 },
                            { label: 'RGB1 (RGB)', type: 'color', key: 'RGB1' },
                            { label: 'Alpha2', type: 'number', key: 'Alpha2', min: 0, max: 255 },
                            { label: 'RGB2 (RGB)', type: 'color', key: 'RGB2' }
                        ]
                    },
                    {
                        title: 'Other Settings',
                        fields: [
                            { label: 'HighlightMinIntensity', type: 'number', key: 'HighlightMinIntensity', min: 0, max: 255 },
                            { label: 'Illumination', type: 'number', key: 'Illumination', min: 0, max: 10, step: 0.1 }
                        ]
                    }
                ];
                
                sections.forEach(section => {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.className = 'mb-6';
                    
                    const sectionTitle = document.createElement('h4');
                    sectionTitle.className = 'text-lg font-medium mb-3 text-gray-800 border-b pb-1';
                    sectionTitle.textContent = section.title;
                    sectionDiv.appendChild(sectionTitle);
                    
                    const fieldsGrid = document.createElement('div');
                    fieldsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
                    
                    section.fields.forEach(field => {
                        const fieldDiv = document.createElement('div');
                        fieldDiv.className = 'mb-3';
                        
                        const label = document.createElement('label');
                        label.className = 'block text-sm font-medium text-gray-700 mb-1';
                        label.textContent = field.label;
                        fieldDiv.appendChild(label);
                        
                        if (field.type === 'color') {
                            const colorDiv = document.createElement('div');
                            colorDiv.className = 'flex items-center gap-2';

                            ['r', 'g', 'b'].forEach(channel => {
                                const input = document.createElement('input');
                                input.type = 'number';
                                input.className = 'color-input px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
                                input.min = 0;
                                input.max = 255;
                                input.required = true;
                                input.placeholder = channel.toUpperCase();
                                input.value = timeData[field.key][channel];

                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'input-error';
                                errorSpan.textContent = 'Must be between 0 and 255';
                                
                                input.addEventListener('input', function() {
                                    const value = parseInt(this.value) || 0;
                                    if (value < 0 || value > 255) {
                                        this.nextElementSibling.style.display = 'block';
                                    } else {
                                        this.nextElementSibling.style.display = 'none';
                                        timeData[field.key][channel] = value;
                                    }
                                });
                                
                                colorDiv.appendChild(input);
                                colorDiv.appendChild(errorSpan);
                            });

                            if (field.hasAlpha) {
                                const alphaInput = document.createElement('input');
                                alphaInput.type = 'number';
                                alphaInput.className = 'color-input px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500';
                                alphaInput.min = 0;
                                alphaInput.max = 255;
                                alphaInput.required = true;
                                alphaInput.placeholder = 'A';
                                alphaInput.value = timeData[field.key]['a'];

                                const errorSpan = document.createElement('span');
                                errorSpan.className = 'input-error';
                                errorSpan.textContent = 'Must be between 0 and 255';
                                
                                alphaInput.addEventListener('input', function() {
                                    const value = parseInt(this.value) || 0;
                                    if (value < 0 || value > 255) {
                                        this.nextElementSibling.style.display = 'block';
                                    } else {
                                        this.nextElementSibling.style.display = 'none';
                                        timeData[field.key]['a'] = value;
                                    }
                                });
                                
                                colorDiv.appendChild(alphaInput);
                                colorDiv.appendChild(errorSpan);
                            }

                            const preview = document.createElement('div');
                            preview.className = 'w-8 h-8 border rounded ml-2';
                            preview.style.backgroundColor = field.hasAlpha ? 
                                `rgba(${timeData[field.key].r}, ${timeData[field.key].g}, ${timeData[field.key].b}, ${timeData[field.key].a/255})` :
                                `rgb(${timeData[field.key].r}, ${timeData[field.key].g}, ${timeData[field.key].b})`;

                            colorDiv.querySelectorAll('input').forEach(input => {
                                input.addEventListener('input', function() {
                                    preview.style.backgroundColor = field.hasAlpha ? 
                                        `rgba(${timeData[field.key].r}, ${timeData[field.key].g}, ${timeData[field.key].b}, ${timeData[field.key].a/255})` :
                                        `rgb(${timeData[field.key].r}, ${timeData[field.key].g}, ${timeData[field.key].b})`;
                                });
                            });
                            
                            colorDiv.appendChild(preview);
                            fieldDiv.appendChild(colorDiv);
                        } else if (field.type === 'number') {
                            const { input, errorSpan } = createValidatedInput(
                                'number', 
                                timeData[field.key], 
                                field.min, 
                                field.max, 
                                field.step
                            );
                            
                            input.addEventListener('input', function() {
                                const value = field.step === 0.1 ? 
                                    parseFloat(this.value) || 0 : 
                                    parseInt(this.value) || 0;
                                    
                                if (this.validity.valid) {
                                    timeData[field.key] = value;
                                }
                            });
                            
                            fieldDiv.appendChild(input);
                            fieldDiv.appendChild(errorSpan);
                        }
                        
                        fieldsGrid.appendChild(fieldDiv);
                    });
                    
                    sectionDiv.appendChild(fieldsGrid);
                    container.appendChild(sectionDiv);
                });

                const copyDiv = document.createElement('div');
                copyDiv.className = 'mt-6';
                
                const copyButton = document.createElement('button');
                copyButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg';
                copyButton.innerHTML = '<i class="fas fa-copy mr-2"></i> Copy these settings to all times';
                
                copyButton.addEventListener('click', function() {
                    if (confirm(`Copy current settings to ALL time periods for ${weatherType}?`)) {
                        times.forEach(t => {
                            if (t !== time) {
                                weatherData[weatherType][t] = JSON.parse(JSON.stringify(timeData));
                            }
                        });
                        alert('Settings copied to all time periods!');
                    }
                });
                
                copyDiv.appendChild(copyButton);
                container.appendChild(copyDiv);
            }

            function generateTimecycContent() {
                const creatorName = creatorNameInput.value.trim() || 'Anonymous';
                const timecycName = timecycNameInput.value.trim() || 'CustomTimecyc';
                
                let content = `// create by ${creatorName}\n`;
                content += `// timecyc - ${timecycName}\n\n`;
                
                const weatherTypes = Object.keys(weatherData);
                
                weatherTypes.forEach((weatherType, index) => {
                    content += `//////////// ${weatherType}\n`;
                    content += `//Amb\tAmb_Obj\tDir\tSky top\tSky bot\tSunCore\tSunCorona\tSunSz\tSprSz\tSprBght\tShdw\tLightShd\tPoleShd\tFarClp\tFogSt\tLightOnGround\tLowCloudsRGB\tBottomCloudRGB\tWaterRGBA\tAlpha1\tRGB1\tAlpha2\tRGB2\tCloudAlpha\tHighlightMinIntensity\tWaterFogAlpha\tIllumination\n`;
                    
                    times.forEach(time => {
                        const data = weatherData[weatherType][time];
                        
                        content += `//${time}\n`;
                        content += `${data.Amb.r} ${data.Amb.g} ${data.Amb.b}\t`; // Amb
                        content += `${data.Amb_Obj.r} ${data.Amb_Obj.g} ${data.Amb_Obj.b}\t`; // Amb_Obj
                        content += `${data.Dir.r} ${data.Dir.g} ${data.Dir.b}\t`; // Dir
                        content += `${data.Sky_top.r} ${data.Sky_top.g} ${data.Sky_top.b}\t`; // Sky top
                        content += `${data.Sky_bot.r} ${data.Sky_bot.g} ${data.Sky_bot.b}\t`; // Sky bot
                        content += `${data.SunCore.r} ${data.SunCore.g} ${data.SunCore.b}\t`; // SunCore
                        content += `${data.SunCorona.r} ${data.SunCorona.g} ${data.SunCorona.b}\t`; // SunCorona
                        content += `${data.SunSz.toFixed(1)}\t`; // SunSz
                        content += `${data.SprSz.toFixed(1)}\t`; // SprSz
                        content += `${data.SprBght.toFixed(1)}\t`; // SprBght
                        content += `${data.Shdw}\t`; // Shdw
                        content += `${data.LightShd}\t`; // LightShd
                        content += `${data.PoleShd}\t`; // PoleShd
                        content += `${data.FarClp.toFixed(1)}\t`; // FarClp
                        content += `${data.FogSt.toFixed(1)}\t`; // FogSt
                        content += `${data.LightOnGround.toFixed(1)}\t`; // LightOnGround
                        content += `${data.LowCloudsRGB.r} ${data.LowCloudsRGB.g} ${data.LowCloudsRGB.b}\t`; // LowCloudsRGB
                        content += `${data.BottomCloudRGB.r} ${data.BottomCloudRGB.g} ${data.BottomCloudRGB.b}\t`; // BottomCloudRGB
                        content += `${data.WaterRGBA.r} ${data.WaterRGBA.g} ${data.WaterRGBA.b} ${data.WaterRGBA.a}\t`; // WaterRGBA
                        content += `${data.Alpha1}\t`; // Alpha1
                        content += `${data.RGB1.r} ${data.RGB1.g} ${data.RGB1.b}\t`; // RGB1
                        content += `${data.Alpha2}\t`; // Alpha2
                        content += `${data.RGB2.r} ${data.RGB2.g} ${data.RGB2.b}\t`; // RGB2
                        content += `${data.CloudAlpha}\t`; // CloudAlpha
                        content += `${data.HighlightMinIntensity}\t`; // HighlightMinIntensity
                        content += `${data.WaterFogAlpha}\t`; // WaterFogAlpha
                        content += `${data.Illumination.toFixed(1)}\n`; // Illumination
                    });
                    
                    if (index < weatherTypes.length - 1) {
                        content += '\n';
                    }
                });
                
                return content;
            }

            function downloadTimecycFile() {
                const content = generateTimecycContent();
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                const creatorName = creatorNameInput.value.trim() || 'Anonymous';
                const timecycName = timecycNameInput.value.trim() || 'CustomTimecyc';
                const fileName = `timecyc_${creatorName}_${timecycName}.dat`.replace(/\s+/g, '_');
                
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            addWeatherBtn.addEventListener('click', function() {
                weatherModal.classList.remove('hidden');
            });
            
            confirmWeatherBtn.addEventListener('click', function() {
                const weatherType = weatherSelect.value;
                
                if (!weatherData[weatherType]) {
                    initWeatherData(weatherType);
                    
                    const tab = createWeatherTab(weatherType);
                    weatherTabs.appendChild(tab);
                    
                    setActiveWeather(weatherType);
                } else {
                    alert('This weather type already exists!');
                }
                
                weatherModal.classList.add('hidden');
            });
            
            cancelWeatherBtn.addEventListener('click', function() {
                weatherModal.classList.add('hidden');
            });
            
            previewBtn.addEventListener('click', function() {
                if (Object.keys(weatherData).length === 0) {
                    alert('Please add at least one weather type first!');
                    return;
                }
                
                previewContent.textContent = generateTimecycContent();
                previewModal.classList.remove('hidden');
            });
            
            closePreviewBtn.addEventListener('click', function() {
                previewModal.classList.add('hidden');
            });
            
            downloadBtn.addEventListener('click', function() {
                if (Object.keys(weatherData).length === 0) {
                    alert('Please add at least one weather type first!');
                    return;
                }
                
                downloadTimecycFile();
            });
            
            downloadFromPreviewBtn.addEventListener('click', function() {
                downloadTimecycFile();
            });
            
            resetBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {

                    for (const key in weatherData) {
                        delete weatherData[key];
                    }

                    weatherTabs.innerHTML = '';
                    weatherContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Select or add a weather type to configure</p>';
                    activeWeather = null;

                    creatorNameInput.value = '';
                    timecycNameInput.value = '';
                }
            });

            initWeatherData('EXTRASUNNY_LA');
            const initialTab = createWeatherTab('EXTRASUNNY_LA');
            initialTab.classList.add('active');
            weatherTabs.appendChild(initialTab);
            setActiveWeather('EXTRASUNNY_LA');

            let draggedWeather = null;
            
            document.querySelectorAll('.draggable-weather').forEach(tab => {
                tab.addEventListener('dragstart', function(e) {
                    draggedWeather = this;
                    e.dataTransfer.setData('text/plain', this.dataset.weather);
                    setTimeout(() => {
                        this.style.opacity = '0.4';
                    }, 0);
                });
                
                tab.addEventListener('dragend', function() {
                    this.style.opacity = '1';
                });
            });
            
            weatherTabs.addEventListener('dragover', function(e) {
                e.preventDefault();
                const afterElement = getDragAfterElement(weatherTabs, e.clientX);
                if (afterElement == null) {
                    this.appendChild(draggedWeather);
                } else {
                    this.insertBefore(draggedWeather, afterElement);
                }
            });
            
            function getDragAfterElement(container, x) {
                const draggableElements = [...container.querySelectorAll('.draggable-weather:not(.dragging)')];
                
                return draggableElements.reduce((closest, child) => {
                    const box = child.getBoundingClientRect();
                    const offset = x - box.left - box.width / 2;
                    if (offset < 0 && offset > closest.offset) {
                        return { offset: offset, element: child };
                    } else {
                        return closest;
                    }
                }, { offset: Number.NEGATIVE_INFINITY }).element;
            }
        });