% Ejercicio 3 - Composición de señal con tres componentes

N = 256;
n = 0:N-1;

% Componentes
DC = 3;                            % Componente continua
A1 = 1; N1 = 10;                   % Primer coseno
A2 = 0.5; N2 = 15;                 % Segundo coseno

x = DC + A1*cos(2*pi*n/N1) + A2*cos(2*pi*n/N2);

% Aplicar ventana de Hamming
w_hamming = 0.54 - 0.46 * cos(2*pi*n/(N-1));
xw = x .* w_hamming;

% FFT
X = fftshift(fft(x)) / N;
Xw = fftshift(fft(xw)) / N;
w = linspace(-pi, pi, N);

% ----------- Representación en el tiempo -----------
figure;
subplot(2,1,1); plot(n, x); title('x[n] - Señal original');
xlabel('n'); ylabel('Amplitud');

subplot(2,1,2); plot(n, xw); title('xw[n] - Señal enventanada (Hamming)');
xlabel('n'); ylabel('Amplitud');

% ----------- Representación en frecuencia -----------
figure;
subplot(2,1,1); stem(w, abs(X)); title('|X(\omega)| - Señal original');
xlabel('\omega [rad/muestra]'); ylabel('Magnitud');

subplot(2,1,2); stem(w, abs(Xw)); title('|Xw(\omega)| - Señal enventanada');
xlabel('\omega [rad/muestra]'); ylabel('Magnitud');
