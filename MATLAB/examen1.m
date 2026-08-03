nx = [-3:3];
x = [3 11 7 0 -1 4 2];
[xd,nxd]=desplazaseq(x,nx,2);
xd = [0 0 xd];
w = rand(1,length(xd));
y = xd + w;
[corrxy,lag] = xcorr(y,x);

figure(1); stem(lag, corrxy);