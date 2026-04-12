const initBirthdaySelects = () => {
    const selectMonth = document.querySelector('select[name="month"]');
    const selectDate = document.querySelector('select[name="date"]');
    const selectYear = document.querySelector('select[name="year"]');

    if (!selectMonth || !selectDate || !selectYear) return;

    const addDefaultOption = (selectElement) => {
        selectElement.innerHTML = '';
        const defaultOpt = document.createElement("option");
        defaultOpt.text = "選択";
        defaultOpt.value = "";
        defaultOpt.disabled = true;
        defaultOpt.selected = true;
        selectElement.appendChild(defaultOpt);
    };

    const currentYear = new Date().getFullYear();
    addDefaultOption(selectYear);
    for (let i = currentYear; i >= currentYear - 100; i--) {
        const opt = new Option(`${i}年`, i);
        selectYear.add(opt);
    }

    addDefaultOption(selectMonth);
    for (let i = 1; i <= 12; i++) {
        const opt = new Option(`${i}月`, i);
        selectMonth.add(opt);
    }

    const updateDays = () => {
        const year = parseInt(selectYear.value);
        const month = parseInt(selectMonth.value);
        const currentSelectedDay = selectDate.value;

        addDefaultOption(selectDate);

        let daysInMonth = 31;
        if (month) {
            daysInMonth = new Date(year || 2000, month, 0).getDate();
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const opt = new Option(`${i}日`, i);
            if (i == currentSelectedDay) opt.selected = true;
            selectDate.add(opt);
        }
    };

    addDefaultOption(selectDate);
    updateDays();

    selectMonth.addEventListener('change', updateDays);
    selectYear.addEventListener('change', updateDays);
}

const initJapanAddress = async () => {
    const provinceSelect = document.querySelector('select[name="province"]');
    const citySelect = document.querySelector('select[name="city"]');
    const postCodeInput = document.querySelector('input[name="postcode"]');
    const postCodeBtn = document.querySelector('.postcode-button');

    let tempCityInput = document.querySelector('input[name="temp_city"]');
    if (!tempCityInput) {
        tempCityInput = document.createElement('input');
        tempCityInput.type = 'hidden';
        tempCityInput.name = 'temp_city';
        document.body.appendChild(tempCityInput);
    }

    if (!provinceSelect || !citySelect) return;

    try {
        const response = await fetch('../assets/js/municipalities.json');
        const data = await response.json();

        // --- Render province ---
        const provinces = [];
        const seenPrefs = new Set();
        data.forEach(item => {
            if (!seenPrefs.has(item.prefecture_kanji)) {
                seenPrefs.add(item.prefecture_kanji);
                provinces.push({
                    name: item.prefecture_kanji,
                    code: item.code.substring(0, 2)
                });
            }
        });
        provinces.sort((a, b) => a.code - b.code);
        provinces.forEach(p => provinceSelect.add(new Option(p.name, p.name)));

        // --- Disable option province if postcode existed ---
        const toggleProvinceLock = () => {
            const hasValue = postCodeInput.value.trim() !== "";
            Object.assign(provinceSelect.style, {
                pointerEvents: hasValue ? "none" : "auto",
                backgroundColor: hasValue ? "#efefef" : "#fff"
            });
            provinceSelect.tabIndex = hasValue ? -1 : 0;
        };

        // --- Update City list ---
        const updateCityList = (selectedPref, targetCityFull = "") => {
            citySelect.innerHTML = '<option value="" disabled selected>選択</option>';
            if (!selectedPref) return;

            const filteredCities = data.filter(item => item.prefecture_kanji === selectedPref);
            let matchedValue = "";

            filteredCities.forEach(city => {
                const cityName = city.name_kanji.trim();
                const searchText = targetCityFull.trim();

                const isMatch = searchText && (searchText.startsWith(cityName) || cityName === searchText);
                
                if (isMatch && !matchedValue) matchedValue = cityName;

                const option = new Option(cityName, cityName, isMatch, isMatch);
                citySelect.add(option);
            });

            citySelect.disabled = false;

            if (matchedValue) {
                citySelect.value = matchedValue;
            }
        };

        provinceSelect.addEventListener('change', (e) => updateCityList(e.target.value));
        postCodeInput.addEventListener('input', toggleProvinceLock);

        // --- AjaxZip3 ---
        const handleZipSearch = () => {
            if (typeof AjaxZip3 === 'undefined') return;

            AjaxZip3.zip2addr('postcode', '', 'province', 'temp_city');

            setTimeout(() => {
                const selectedPref = provinceSelect.value;
                const fullCityText = tempCityInput.value;

                if (selectedPref && fullCityText) {
                    updateCityList(selectedPref, fullCityText);
                    toggleProvinceLock();
                }
            }, 200);
        };

        if (postCodeBtn) {
            postCodeBtn.style.cursor = 'pointer';
            postCodeBtn.addEventListener('click', handleZipSearch);
        }

    } catch (err) {
        console.error("Error get data:", err);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initBirthdaySelects();
    initJapanAddress();
});