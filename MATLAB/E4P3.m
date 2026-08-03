% Cargar el archivo con la señal hrv1
load('hrv1.mat'); % Ajusta la ruta si es necesario


    
    
    [autocov_hrv1, lags_cov] = xcov(hrv1, 'biased');

    
    [autocorr_hrv1_orig, lags_corr] = xcorr(hrv1, 'biased');

    
    hrv1_mean_removed = hrv1 - mean(hrv1);
    [autocorr_hrv1_mean_removed, lags_corr2] = xcorr(hrv1_mean_removed, 'biased');

    
    figure;
    subplot(3,1,1);
    plot(lags_cov, autocov_hrv1);
    title('Autocovarianza de hrv1 usando xcov');
    xlabel('Desplazamiento');
    ylabel('Autocovarianza');
    grid on;

    subplot(3,1,2);
    plot(lags_corr, autocorr_hrv1_orig);
    title('Autocorrelación de hrv1 original usando xcorr');
    xlabel('Desplazamiento');
    ylabel('Autocorrelación');
    grid on;

    subplot(3,1,3);
    plot(lags_corr2, autocorr_hrv1_mean_removed);
    title('Autocorrelación de hrv1 con media eliminada usando xcorr');
    xlabel('Desplazamiento');
    ylabel('Autocorrelación');
    grid on;


