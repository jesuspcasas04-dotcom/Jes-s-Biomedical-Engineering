
load('pract_emg.mat');

% Parámetros
Fs = 2000;              
inct = 1/Fs;            
L = round(0.25/inct);   
nfft = 2^nextpow2(L);   
overlap = 0.5;          
noverlap = round(overlap * nfft); 

% Estimación Welch
[pw_start, f] = pwelch(EMG_Start, L, noverlap, nfft, Fs);
[pw_end, ~] = pwelch(EMG_End, L, noverlap, nfft, Fs);

% Representación gráfica (0–300 Hz)
figure;
plot(f, pw_start, 'b', 'DisplayName', 'EMG sin fatiga'); hold on;
plot(f, pw_end, 'r', 'DisplayName', 'EMG con fatiga');
xlim([0 300]);
xlabel('Frecuencia (Hz)');
ylabel('PSD (mV^2/Hz)');
title('Densidad Espectral de Potencia (método de Welch)');
legend;
grid on;

% Cálculo de frecuencia media y mediana
freq_mean_start = meanfreq(EMG_Start, Fs);
freq_median_start = medfreq(EMG_Start, Fs);

freq_mean_end = meanfreq(EMG_End, Fs);
freq_median_end = medfreq(EMG_End, Fs);

% Mostrar resultados en consola
fprintf('\n--- Frecuencias EMG sin fatiga ---\n');
fprintf('Frecuencia media: %.2f Hz\n', freq_mean_start);
fprintf('Frecuencia mediana: %.2f Hz\n', freq_median_start);

fprintf('\n--- Frecuencias EMG con fatiga ---\n');
fprintf('Frecuencia media: %.2f Hz\n', freq_mean_end);
fprintf('Frecuencia mediana: %.2f Hz\n', freq_median_end);
