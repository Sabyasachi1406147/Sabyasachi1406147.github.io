// All website content lives here. Edit this file, then run: node src/build.js
// Strings may contain simple HTML (<i>, <a>). "S. Biswas" is bolded automatically in references.

const SITE = {
  name: 'Sabyasachi Biswas',
  url: 'https://sabyasachi1406147.github.io',
  role: 'Assistant Professor of Electrical and Computer Engineering',
  org: 'Grand Valley State University',
  dept: 'Department of Electrical and Computer Engineering, Seymour and Esther Padnos College of Engineering and Computing',
  tagline: 'Making the invisible visible, through RF sensing and explainable AI.',
  email: 'biswass@gvsu.edu',
  email2: 'sabyasachi1406147@gmail.com',
  office: ['Room 247, John C. Kennedy Hall of Engineering', '301 West Fulton Street', 'Grand Rapids, MI 49504'],
  cvPdf: 'assets/Sabyasachi_Biswas_CV.pdf',
  photo: 'assets/img/profile.jpg',
  links: [
    ['Google Scholar', 'https://scholar.google.com/citations?user=SLDhricAAAAJ&hl=en'],
    ['GitHub', 'https://github.com/Sabyasachi1406147'],
    ['LinkedIn', 'https://www.linkedin.com/in/sabyasachi-biswas-584589117/'],
    ['Web of Science', 'https://www.webofscience.com/wos/author/record/JFA-3339-2023'],
  ],
  updated: 'November 2026',
};

const BIO = [
  'I am an Assistant Professor of Electrical and Computer Engineering at Grand Valley State University. I work on radar and RF signal processing and interpretable machine learning. My networks start from raw I/Q data and learn physically meaningful filters, so they are fast enough for real-time sensing and their decisions can be checked by an RF engineer.',
  'I earned my Ph.D. in Electrical and Computer Engineering at Mississippi State University in 2025, advised by <a href="https://ece.ncsu.edu/people/acgurbuz/">Dr. Ali C. Gurbuz</a> and <a href="https://www.ece.msstate.edu/people/faculty/dr-john-e-ball/">Dr. John E. Ball</a>, and stayed on as a postdoctoral research associate building multimodal threat-detection systems with radar, acoustic, LiDAR and camera sensors. Before that I developed head-tracking algorithms for immersive audio as a research co-op at Bose, worked on radio network coverage as an engineer at Banglalink, and taught at Daffodil International University after my B.Sc. at BUET.',
  'My work appears in <i>IEEE Transactions on Radar Systems</i>, <i>IET Radar, Sonar &amp; Navigation</i>, <i>IEEE JSTARS</i>, <i>Manufacturing Letters</i>, the IEEE Radar Conference and the ICCV workshops, and has been supported through projects funded by NSF, AFRL, the U.S. Army ERDC and USDA.',
];

// Three research thrusts. "glyph" picks the small animated figure on the home page.
const THRUSTS = [
  {
    id: 'interpretable', glyph: 'filters',
    title: 'Interpretable learning from raw RF data',
    short: 'Complex-valued networks whose first layer is a bank of learnable Sinc, Gaussian or Gammatone filters. Each filter learns only a center frequency and a bandwidth, so a trained model shows which parts of the spectrum it relies on.',
    long: [
      'Most deep networks for radar and RF start from a spectrogram, which costs time and throws away phase. I build complex-valued networks that read raw I/Q samples directly. Their first layer is a bank of parameterized filters, each defined by a center frequency and a bandwidth. Training moves those two numbers, so after training you can read off what the network is listening to.',
      'The same idea transfers beyond radar: learnable filters classify bearing faults from vibration data and abdominal organs from ultrasound images with a fraction of the parameters of a standard CNN.',
    ],
    figure: 'filters',
    projects: [
      ['PLFNets', 'Sinc, Gaussian, Gammatone and Ricker filters as the first layer of a complex-valued CNN on raw I/Q. About 47% more accurate than 1D CNNs on raw RF data, about 7% better than real-valued learnable filters, and around 75% lower latency than spectrogram-based 2D CNNs.', [['Paper', 'https://doi.org/10.1109/TRS.2024.3486183'], ['Code', 'https://github.com/Sabyasachi1406147/PLFNets']]],
      ['CV-SincNet', 'Complex sinc filters learned directly from raw radar data for computationally efficient human motion recognition.', [['Paper', 'https://doi.org/10.1109/TRS.2023.3310894']]],
      ['Learnable Gaussian filters for modulation recognition', 'Filters with learnable cutoff frequencies extract physically meaningful features from raw RF data, reaching 97.4% accuracy without heavy preprocessing. Student Paper Competition finalist at RADAR 2025.', [['Paper', 'https://doi.org/10.1109/NAECON61878.2024.10670353']]],
      ['TG-PLFNet and a 51-class waveform dataset', 'Ongoing: time-gated learnable filters that classify raw I/Q without any time–frequency transform, and a public dataset of 51 radar and communication waveforms for reproducible benchmarking.', []],
      ['Learnable filters beyond radar', 'Gaussian and Sinc filters for bearing fault diagnosis from raw vibration data (up to 99.5% accuracy), and learnable 2D Gaussian filters for real-time ultrasound organ classification (87.81%, about 4% above standard CNNs).', [['Bearing faults', 'https://doi.org/10.1016/j.mfglet.2025.06.015'], ['Ultrasound', 'https://doi.org/10.1117/12.3053222']]],
    ],
  },
  {
    id: 'resolution', glyph: 'resolution',
    title: 'Resolution beyond the FFT',
    short: 'Networks that denoise and sharpen range and time–frequency estimates, separating targets closer together than the FFT’s Rayleigh limit and producing crisper micro-Doppler signatures for classification.',
    long: [
      'The FFT and the short-time Fourier transform trade resolution against observation time: two targets closer than the Rayleigh limit merge into one blurred peak. I design networks that denoise the raw signal, learn a frequency transform, and reconstruct a sparse, high-resolution estimate with lower sidelobes.',
      'Sharper representations are not an end in themselves. Cleaner micro-Doppler signatures make downstream activity classifiers more accurate, and the same reconstruction approach carries over to vibration spectrograms for machine health monitoring.',
    ],
    figure: 'resolution',
    projects: [
      ['HRSpecNet', 'An autoencoder denoiser, a learnable convolutional STFT and a U-Net turn 1D complex radar signals into sharp micro-Doppler signatures, improving activity classification by over 3% while staying efficient.', [['Paper', 'https://doi.org/10.1109/TRS.2024.3396172'], ['Code', 'https://github.com/Sabyasachi1406147/HRSpecNet']]],
      ['HRFreqNet', 'Denoising, learned frequency transforms and a 1D U-Net produce sparse range profiles with lower sidelobes than the FFT, beyond the Rayleigh resolution limit.', [['Paper', 'https://doi.org/10.1109/RadarConf2458775.2024.10548421'], ['Code', 'https://github.com/Sabyasachi1406147/HRFreqNet']]],
      ['Beyond FFT', 'In preparation: a learnable path to high-resolution frequency analysis from 1D complex time-domain radar data, with denoising, frequency-estimation and reconstruction blocks.', []],
      ['High-resolution spectrograms for fault diagnosis', 'Adaptive denoising and multi-resolution time–frequency learning from raw vibration signals capture subtle fault signatures and generalize across operating conditions.', [['Paper', 'https://doi.org/10.1016/j.mfglet.2026.07.019']]],
    ],
  },
  {
    id: 'sensing', glyph: 'doppler',
    title: 'Sensing people and places with RF',
    short: 'Radar and Wi-Fi sensing of human activity, gestures and sign language; separating several people with MIMO radar; and fusing radar with LiDAR, cameras and thermal imaging for autonomy and safety.',
    long: [
      'Radar sees motion through darkness, smoke and clothing, and it does not record faces. That makes it a natural sensor for homes, hospitals and public spaces where cameras are unwelcome. My group studies how to recognize what people are doing from radar and Wi-Fi signals, how to separate several people in the same scene, and when to fuse RF with cameras, LiDAR, thermal and acoustic sensors.',
      'Applications range from elder care and sign-language interfaces to traffic-gesture recognition for driver assistance and threat detection on ground robots.',
    ],
    figure: 'activity',
    projects: [
      ['Multi-target recognition with angular subspace projection', 'Angle-conditioned radar data cubes separate overlapping people into multi-view spectrograms: 97.8% accuracy on a nine-class, three-person task using a network trained on single-person data.', [['Paper', 'https://doi.org/10.1049/rsn2.12405']]],
      ['Sign language from radar and video', 'A multimodal video–radar fusion framework for isolated sign recognition, and RF-ChessSIGN, a real-time sign-controlled game, both at the ICCV 2025 workshops. 2nd runner-up in the ICCV 2025 Multimodal Italian Sign Language Recognition challenge.', [['Challenge', 'https://www.kaggle.com/competitions/iccv-mslr-2025-track-2']]],
      ['Wi-Fi CSI versus radar', 'A 77 GHz TI FMCW radar against a Raspberry Pi with Nexmon firmware on a seven-class activity task: radar was 32.7% more accurate, and low-cost Wi-Fi showed promise for indoor monitoring.', [['Paper', 'https://doi.org/10.1109/RadarConf2458775.2024.10548515']]],
      ['Traffic-signaling gestures for driver assistance', 'A new dataset of traffic-direction gestures captured with mmWave radar, cameras, LiDAR and motion capture; radar micro-Doppler with a CNN reached about 92% accuracy, and radar–LiDAR fusion improved it further.', [['Paper', 'https://doi.org/10.1109/RadarConf2351548.2023.10149728'], ['Code', 'https://github.com/Sabyasachi1406147/Traffic_sign_detection']]],
      ['Multimodal threat detection', 'Spectral-polarimetric imaging, radar micro-Doppler and acoustic arrays on robotic platforms, fused at the data, feature and decision levels to detect hazards in low-visibility and subterranean environments.', []],
      ['SDR radiometer for small drones', 'A compact, dual-polarized L-band radiometer built on a software-defined radio, with onboard RFI mitigation, flown on small unmanned aircraft.', [['Paper', 'https://doi.org/10.1109/JSTARS.2024.3394054']]],
    ],
  },
];

const INSTRUMENTS = ['TI 1443 and 1643 mmWave radars', 'TI 2243 cascade imaging radar', 'INRAS Radarbook 2', 'Vayyar IMAGEVK-74', 'Ettus USRP B210 software-defined radios', 'Azure Kinect and Intel RealSense depth cameras', 'Velodyne LiDAR', 'Clearpath Husky rover', 'Boston Dynamics Spot'];

const NEWS = [
  ['Fall 2026', 'Serving as Guest Editor of the <i>Electronics</i> (MDPI) Special Issue “<a href="https://www.mdpi.com/journal/electronics/special_issues/GQMHBJH3GU">Advanced Radar Sensing and Signal Processing for Intelligent Systems</a>.” Submissions are open until 31 March 2027.'],
  ['Fall 2026', '“Deep learning-based high-resolution spectrogram reconstruction for robust bearing fault diagnosis” published in <i>Manufacturing Letters</i>, with Saifur Rahman Tushar, Md Ebtidaul Karim, Dr. Abdullah Al Mamun and Dr. Mahathir Mohammad Bappy.'],
  ['Aug 2026', 'Joined the Department of Electrical and Computer Engineering at Grand Valley State University as an Assistant Professor.'],
  ['2026', 'Session Manager at IEEE VTC2026-Fall in Boston, for the track on vehicular cooperation, communication, radar and control.'],
  ['Jun 2026', 'Three co-authored papers in SPIE proceedings, on <a href="https://doi.org/10.1117/12.3094611">GAN-based ultrasound augmentation</a>, a <a href="https://doi.org/10.1117/12.3095052">multimodal rover for sensor fusion</a> and <a href="https://doi.org/10.1117/12.3094964">radar–thermal fusion for low-visibility navigation</a>, plus a <a href="https://doi.org/10.1109/MAES.2025.3608679">collaborative article</a> by the RADAR 2025 student paper finalists in <i>IEEE Aerospace and Electronic Systems Magazine</i>.'],
  ['Dec 2025', 'Received the Ph.D. in Electrical and Computer Engineering from Mississippi State University.'],
  ['Sep 2025', 'Received the Bagley College of Engineering Best Graduate Student Researcher award for 2024–25, and began as a postdoctoral research associate at Mississippi State.'],
  ['Jul 2025', 'Defended my dissertation on complex-valued parameterized learnable filters. Two papers accepted to the ICCV 2025 workshops.'],
  ['Jun 2025', 'With Sultan Mohammad Manjur, 2nd runner-up in the ICCV 2025 <a href="https://www.kaggle.com/competitions/iccv-mslr-2025-track-2/overview">Multimodal Italian Sign Language Recognition</a> challenge.'],
  ['May 2025', 'Presented at the 2025 IEEE International Radar Conference in Atlanta, where our paper on learnable Gaussian filters for modulation recognition was a Student Paper Competition finalist.'],
  ['Feb 2025', 'Received the ECE Department’s Best Graduate Researcher award for 2024–25 at Mississippi State.'],
];

// Publications. type: journal | conference | prep. Order: newest first within type.
const PUBS = [
  ['journal', 2026, 'S. Biswas, S. R. Tushar, M. E. Karim, A. A. Mamun, and M. M. Bappy, “Deep learning-based high-resolution spectrogram reconstruction for robust bearing fault diagnosis,” <i>Manufacturing Letters</i>, vol. 49, pp. 98–109, 2026.', '10.1016/j.mfglet.2026.07.019'],
  ['journal', 2025, 'S. Biswas, A. A. Mamun, MDS. Islam, and M. M. Bappy, “Interpretable CNN models for computationally efficient bearing fault diagnosis using learnable Gaussian/Sinc filters,” <i>Manufacturing Letters</i>, vol. 44, Supplement, pp. 110–120, Aug. 2025.', '10.1016/j.mfglet.2025.06.015'],
  ['journal', 2024, 'S. Biswas, C. O. Ayna, and A. C. Gurbuz, “PLFNets: Interpretable Complex-Valued Parameterized Learnable Filters for Computationally Efficient RF Classification,” <i>IEEE Transactions on Radar Systems</i>, vol. 2, pp. 1102–1111, 2024.', '10.1109/TRS.2024.3486183', [['Code', 'https://github.com/Sabyasachi1406147/PLFNets']]],
  ['journal', 2024, 'M. M. Farhad, A. M. Alam, S. Biswas, M. A. S. Rafi, A. C. Gurbuz, and M. Kurum, “SDR-Based Dual Polarized L-Band Microwave Radiometer Operating from Small UAS Platforms,” <i>IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing</i>, vol. 17, pp. 9389–9402, 2024.', '10.1109/JSTARS.2024.3394054'],
  ['journal', 2024, 'S. Biswas, A. Manavi Alam, and A. C. Gurbuz, “HRSpecNET: A Deep Learning-Based High-Resolution Radar Micro-Doppler Signature Reconstruction for Improved HAR Classification,” <i>IEEE Transactions on Radar Systems</i>, vol. 2, pp. 484–497, 2024.', '10.1109/TRS.2024.3396172', [['Code', 'https://github.com/Sabyasachi1406147/HRSpecNet']]],
  ['journal', 2023, 'S. Biswas, C. O. Ayna, S. Z. Gurbuz, and A. C. Gurbuz, “CV-SincNet: Learning Complex Sinc Filters from Raw Radar Data for Computationally Efficient Human Motion Recognition,” <i>IEEE Transactions on Radar Systems</i>, vol. 1, pp. 493–504, 2023.', '10.1109/TRS.2023.3310894'],
  ['journal', 2023, 'E. Kurtoğlu, S. Biswas, A. C. Gurbuz, and S. Z. Gurbuz, “Boosting multi-target recognition performance with multi-input multi-output radar-based angular subspace projection and multi-view deep neural network,” <i>IET Radar, Sonar &amp; Navigation</i>, vol. 17, no. 7, pp. 1115–1128, 2023.', '10.1049/rsn2.12405'],

  ['conference', 2026, 'S. Biswas, S. Z. Karim, B. Hicks, G. Ball, A. Islam, M. McClain, P. Chaudhary, L. Dabbiru, and J. E. Ball, “Multimodal rover platform for sensor fusion and situational awareness,” in <i>Proc. SPIE 14044, Autonomous Systems: Sensors, Processing, and Security for Ground, Air, Sea, and Space Vehicles and Infrastructure 2026</i>, 140440R, Jun. 2026.', '10.1117/12.3095052'],
  ['conference', 2026, 'S. Z. Karim, S. Biswas, M. McClain, P. Chaudhary, A. Islam, L. Dabbiru, and J. E. Ball, “Radar-thermal fusion for navigation in low-visibility conditions,” in <i>Proc. SPIE 14044, Autonomous Systems: Sensors, Processing, and Security for Ground, Air, Sea, and Space Vehicles and Infrastructure 2026</i>, 140440Q, Jun. 2026.', '10.1117/12.3094964'],
  ['conference', 2025, 'S. M. Manjur*, S. Biswas*, and A. C. Gurbuz, “A Multimodal Video and Radar Fusion Framework for High-Accuracy Isolated Sign Language Recognition,” in <i>Proc. IEEE/CVF International Conference on Computer Vision (ICCV) Workshops</i>, 2025, pp. 5061–5070. (*equal contribution)'],
  ['conference', 2025, 'K. DeHaan, E. Kurtoğlu, S. Biswas, C. Kobek Pezzarossi, D. J. Griffin, C. Crawford, A. C. Gurbuz, E. A. Malaia, A. Glasser, R. Kushalnagar, and S. Z. Gurbuz, “RF-ChessSIGN: Radar-enabled Human-Computer Interaction in a Real-Time Sign Language-Controlled Game,” in <i>Proc. IEEE/CVF International Conference on Computer Vision (ICCV) Workshops</i>, 2025, pp. 5000–5010.'],
  ['conference', 2025, 'B. Hicks, S. Biswas, and A. C. Gurbuz, “Learnable Gaussian Filter-based Automatic RF Waveform Modulation Recognition,” in <i>Proc. 2025 IEEE International Radar Conference (RADAR)</i>, Atlanta, GA, USA, 2025, pp. 1–6. Student Paper Competition finalist.', null, [['IEEE Xplore', 'https://ieeexplore.ieee.org/document/11162602']]],
  ['conference', 2025, 'S. Z. Karim, S. Biswas, and J. E. Ball, “Learnable 2D Gaussian filters for computationally efficient abdominal organ classification,” in <i>Proc. SPIE 13458, Real-Time Image Processing and Deep Learning 2025</i>, 1345802, May 2025.', '10.1117/12.3053222'],
  ['conference', 2025, 'B. Hicks, S. Biswas, J. E. Ball, and A. C. Gurbuz, “Automatic classification of radar and communication waveforms through interpretable deep learning,” in <i>Proc. SPIE 13471, Radar Sensor Technology XXIX</i>, 134710M, May 2025.', '10.1117/12.3054111'],
  ['conference', 2025, 'K. Nucum, S. Biswas, and J. E. Ball, “Micro-Doppler models of drones, birds, and bird-like drones,” in <i>Proc. SPIE 13471, Radar Sensor Technology XXIX</i>, 134710D, May 2025.', '10.1117/12.3052657'],
  ['conference', 2024, 'S. Biswas, A. M. Alam, and A. C. Gurbuz, “Deep Learning-Based High-Resolution Radar Micro-Doppler Signature Reconstruction for Enhanced Activity Recognition,” in <i>Proc. 2024 IEEE Radar Conference (RadarConf24)</i>, Denver, CO, USA, 2024, pp. 1–6.', '10.1109/RadarConf2458775.2024.10548969'],
  ['conference', 2024, 'S. Biswas and A. C. Gurbuz, “Deep Learning Based High-Resolution Frequency Estimation for Sparse Radar Range Profiles,” in <i>Proc. 2024 IEEE Radar Conference (RadarConf24)</i>, Denver, CO, USA, 2024, pp. 1–6.', '10.1109/RadarConf2458775.2024.10548421', [['Code', 'https://github.com/Sabyasachi1406147/HRFreqNet']]],
  ['conference', 2024, 'A. M. Alam, C. O. Ayna, S. Biswas, J. T. Rogers, J. E. Ball, and A. C. Gurbuz, “Deep Learning-Based Direction-of-Arrival Estimation with Covariance Reconstruction,” in <i>Proc. 2024 IEEE Radar Conference (RadarConf24)</i>, Denver, CO, USA, 2024, pp. 1–6.', '10.1109/RadarConf2458775.2024.10548988'],
  ['conference', 2024, 'B. Debnath, I. A. Ebu, S. Biswas, A. C. Gurbuz, and J. E. Ball, “FMCW Radar Range Profile and Micro-Doppler Signature Fusion for Improved Traffic Signaling Motion Classification,” in <i>Proc. 2024 IEEE Radar Conference (RadarConf24)</i>, Denver, CO, USA, 2024, pp. 1–6.', '10.1109/RadarConf2458775.2024.10548322'],
  ['conference', 2024, 'A. Dahal, S. Biswas, S. Z. Gurbuz, and A. C. Gurbuz, “Comparison Between Wi-Fi-CSI and Radar-Based HAR,” in <i>Proc. 2024 IEEE Radar Conference (RadarConf24)</i>, Denver, CO, USA, 2024, pp. 1–6.', '10.1109/RadarConf2458775.2024.10548515'],
  ['conference', 2024, 'B. Hicks, S. Biswas, A. Dahal, V. Gonzalez, and A. C. Gurbuz, “Automatic Waveform Recognition from Complex RF Data with Filter-based Deep Learning,” in <i>Proc. IEEE National Aerospace and Electronics Conference (NAECON 2024)</i>, Dayton, OH, USA, 2024, pp. 168–172.', '10.1109/NAECON61878.2024.10670353'],
  ['conference', 2024, 'A. Dahal, S. Biswas, S. Z. Gurbuz, and A. C. Gurbuz, “Robustness analysis of Wi-Fi-based human activity recognition,” in <i>Proc. SPIE 13036, Big Data VI: Learning, Analytics, and Applications</i>, 130360J, June 2024.', '10.1117/12.3014010'],
  ['conference', 2023, 'S. Biswas, J. E. Ball, and A. C. Gurbuz, “Radar-Lidar Fusion for Classification of Traffic Signaling Motion in Automotive Applications,” in <i>Proc. 2023 IEEE International Radar Conference (RADAR)</i>, Sydney, Australia, 2023, pp. 1–5.', '10.1109/RADAR54928.2023.10371020'],
  ['conference', 2023, 'S. Biswas, B. Bartlett, J. E. Ball, and A. C. Gurbuz, “Classification of Traffic Signaling Motion in Automotive Applications Using FMCW Radar,” in <i>Proc. 2023 IEEE Radar Conference (RadarConf23)</i>, San Antonio, TX, USA, 2023, pp. 1–6.', '10.1109/RadarConf2351548.2023.10149728', [['Code', 'https://github.com/Sabyasachi1406147/Traffic_sign_detection']]],
  ['conference', 2023, 'S. Biswas, C. O. Ayna, S. Z. Gurbuz, and A. C. Gurbuz, “Complex SincNet for More Interpretable Radar Based Activity Recognition,” in <i>Proc. 2023 IEEE Radar Conference (RadarConf23)</i>, San Antonio, TX, USA, 2023, pp. 1–6.', '10.1109/RadarConf2351548.2023.10149682'],
  ['conference', 2023, 'M. M. Farhad, S. Biswas, A. M. Alam, A. C. Gurbuz, and M. Kurum, “SDR Based Agile Radiometer with Onboard RFI Processing on a Small UAS,” in <i>Proc. IGARSS 2023, IEEE International Geoscience and Remote Sensing Symposium</i>, Pasadena, CA, USA, 2023, pp. 4368–4371.', '10.1109/IGARSS52108.2023.10282140'],
  ['conference', 2022, 'M. M. Farhad, S. Biswas, M. A. S. Rafi, M. Kurum, and A. C. Gurbuz, “Design and Implementation of a Software Defined Radio-Based Radiometer Operating from a Small Unmanned Aircraft Systems,” in <i>Proc. 2022 IEEE USNC-URSI Radio Science Meeting (Joint with AP-S Symposium)</i>, Denver, CO, USA, 2022, pp. 17–18.', '10.23919/USNC-URSI52669.2022.9887529'],
  ['conference', 2020, 'B. Debnath, S. Biswas, and M. F. Uddin, “Optimization of Electric Vehicle Charging to Shave Peak Load for Integration in Smart Grid,” in <i>Proc. 2020 IEEE Region 10 Symposium (TENSYMP)</i>, Dhaka, Bangladesh, 2020, pp. 483–488.', '10.1109/TENSYMP50017.2020.9231029'],
  ['conference', 2019, 'S. Hossain, B. Debnath, S. Biswas, M. J. Al-Hossain, A. Anika, and S. K. Zaman Navid, “Estimation of Blood Glucose from PPG Signal Using Convolutional Neural Network,” in <i>Proc. 2019 IEEE International Conference on Biomedical Engineering, Computer and Information Technology for Health (BECITHCON)</i>, Dhaka, Bangladesh, 2019, pp. 53–58.', '10.1109/BECITHCON48839.2019.9063187'],
  ['conference', 2019, 'S. Hossain, B. Debnath, A. Anika, M. Junaed-Al-Hossain, S. Biswas, and C. Shahnaz, “Autonomous Trash Collector Based on Object Detection Using Deep Neural Network,” in <i>Proc. TENCON 2019, IEEE Region 10 Conference</i>, Kochi, India, 2019, pp. 1406–1410.', '10.1109/TENCON.2019.8929270'],

  ['prep', 2027, 'S. Biswas, B. Hicks, J. E. Ball, and A. C. Gurbuz, “Comprehensive RF Modulation Recognition Using Parameterized Learnable Filters: A 51-Class Dataset of Communication and Radar Waveforms,” to be submitted to <i>IEEE Transactions on Radar Systems</i>.'],
  ['prep', 2027, 'S. Biswas, R. Krishna Kanth, and A. C. Gurbuz, “Beyond FFT: A Learnable Path to High-Resolution Frequency Analysis for Radar Signal Processing,” to be submitted to <i>IEEE Transactions on Radar Systems</i>.'],
];

// Index (0-based within PUBS) of the publications featured on the home page.
const SELECTED = [[4, 'pub-hrspecnet.jpg', 'HRSpecNet architecture: auto-encoder denoiser, convolutional STFT block and U-Net'], [2, 'pub-plfnets.jpg', 'PLFNet architecture: parameterized learnable filter block followed by complex-valued convolutional blocks'], [6, 'pub-asps.jpg', 'Angular subspace projection framework: target detection and projection, then per-target micro-Doppler classification']];

// Research interests, the general set used on the public CV.
const INTERESTS = [
  ['Radar and RF signal processing', ['Raw I/Q radar processing: micro-Doppler, range–Doppler, range–angle', 'High-resolution time–frequency and spectral estimation beyond STFT/FFT limits', 'RF waveform and modulation recognition with software-defined radios']],
  ['Machine learning', ['Interpretable, complex-valued networks with learnable filters', 'Deep learning for denoising and high-resolution reconstruction', 'Efficient models for real-time and edge deployment']],
  ['RF sensing applications', ['Human activity, gesture and sign-language recognition', 'Radar–LiDAR–camera–thermal fusion for autonomy', 'Wi-Fi and RF sensing for smart environments and health']],
];

// "At a glance" rows on the home page: [number, unit, text]
const GLANCE = [
  [30, '', 'peer-reviewed papers: <b>7 journal articles</b> (5 first-author) and <b>23 conference papers</b>, including three first-author articles in <i>IEEE Transactions on Radar Systems</i>.'],
  [15, '', 'student researchers advised and mentored, from high school to Ph.D., at GVSU, Mississippi State and NC State.'],
  [2, '', 'Best Graduate Researcher awards for 2024–25, from the Bagley College of Engineering and the ECE department at Mississippi State.'],
  [3, '', 'universities where I have taught circuits, electronics, signals and systems, and DSP: GVSU, Mississippi State and Daffodil International University.'],
  [7, '', 'journals I review for, including <i>IEEE TAES</i>, <i>IEEE TRS</i> and <i>IEEE TGRS</i>; Guest Editor of an <i>Electronics</i> (MDPI) special issue on radar sensing.'],
];

const STUDENTS = {
  current: [
    ['Nahid Islam', 'M.S., Electrical Engineering, GVSU', 'Advisor', 'Since 2026'],
    ['David Cheptegei', 'M.S., Electrical Engineering, GVSU', 'Advisor', 'Since 2026'],
    ['Krishna Kanth Rokkam', 'Ph.D., North Carolina State University', 'Research mentor: radar signal processing and explainable AI', 'Since Aug 2025'],
  ],
  past: [
    ['Scorpion Project team', 'Grace Ball (M.S.), Sifat Zina Karim (Ph.D.), and undergraduates Sisson Eric, Ayan Islam, Mars McClain, Frazure Elijah, Niraj Ghimire, Piyush Chaudhary and Ankit Dhakal, Mississippi State', 'Project mentor: multimodal threat detection', 'Apr 2025 – Aug 2026'],
    ['Kester Nucum', 'M.S. thesis, Mississippi State: radar–camera drone detection', 'Research mentor', 'Aug 2024 – Apr 2025'],
    ['Ajaya Dahal', 'M.S. thesis, Mississippi State: Wi-Fi CSI versus FMCW radar for activity recognition', 'Research mentor', 'Apr – Dec 2023'],
    ['Georgianna McKenny', 'High school senior, Mississippi School for Mathematics and Science: time–frequency analysis in MATLAB', 'Research mentor', 'Aug – Dec 2023'],
  ],
};

const ADVISING = [
  // [name, note, program, role, period, papers?: [title, venue, doi]]
  ['Grand Valley State University, MI, USA', [
    ['Nahid Islam', '', 'M.S., Electrical Engineering', 'Advisor', '2026 – Present'],
    ['David Cheptegei', '', 'M.S., Electrical Engineering', 'Advisor', '2026 – Present'],
  ]],
  ['North Carolina State University, NC, USA', [
    ['Krishna Kanth Rokkam', 'Radar signal processing and explainable AI', 'Ph.D.', 'Research mentor', 'Aug 2025 – Present'],
  ]],
  ['Mississippi State University, MS, USA', [
    ['Scorpion Project team', 'Grace Ball (M.S.), Sifat Zina Karim (Ph.D.); undergraduates Sisson Eric, Ayan Islam, Mars McClain, Frazure Elijah, Niraj Ghimire, Piyush Chaudhary, Ankit Dhakal', 'B.S., M.S., Ph.D.', 'Project mentor', 'Apr 2025 – Aug 2026', [
      ['Multimodal rover platform for sensor fusion and situational awareness', 'SPIE Autonomous Systems 2026', '10.1117/12.3095052'],
      ['Radar-thermal fusion for navigation in low-visibility conditions', 'SPIE Autonomous Systems 2026', '10.1117/12.3094964'],
    ]],
    ['Kester Nucum', 'Radar–camera drone detection', 'M.S. (thesis)', 'Research mentor', 'Aug 2024 – Apr 2025', [
      ['Micro-Doppler models of drones, birds, and bird-like drones', 'SPIE Radar Sensor Technology 2025', '10.1117/12.3052657'],
    ]],
    ['Ajaya Dahal', 'Wi-Fi CSI versus FMCW radar for activity recognition', 'M.S. (thesis)', 'Research mentor', 'Apr – Dec 2023', [
      ['Comparison between Wi-Fi-CSI and radar-based HAR', 'IEEE RadarConf 2024', '10.1109/RadarConf2458775.2024.10548515'],
      ['Robustness analysis of Wi-Fi-based human activity recognition', 'SPIE Big Data VI 2024', '10.1117/12.3014010'],
    ]],
  ]],
  ['Mississippi School for Mathematics and Science (with Mississippi State University)', [
    ['Georgianna McKenny', 'Time–frequency analysis in MATLAB', 'High school senior', 'Research mentor', 'Aug – Dec 2023'],
  ]],
];

const TEACHING = [
  ['Grand Valley State University', 'Assistant Professor', 'since Aug 2026', [
    ['EGR 214', 'Circuit Analysis I', 'Instructor', 'Winter 2027', ''],
    ['EGR 215', 'Circuit Analysis I Lab', 'Instructor', 'Winter 2027', ''],
    ['EGR 223', 'Probability and Signal Analysis', 'Instructor', 'Winter 2027', ''],
    ['EGR 214', 'Circuit Analysis I', 'Instructor', 'Fall 2026', '19'],
    ['EGR 215', 'Circuit Analysis I Lab, two sections', 'Instructor', 'Fall 2026', '16, 14'],
    ['EGR 315', 'Electronics Lab', 'Instructor', 'Fall 2026', '17'],
  ]],
  ['Mississippi State University', 'Graduate Teaching Assistant', '2021 – 2025', [
    ['', 'Signals and Systems', 'Interim Instructor', 'Fall 2023', '37'],
    ['', 'Signals and Systems', 'Interim Instructor', 'Spring 2025', '33'],
    ['', 'Advanced Electronic Circuits', 'Lab Instructor and Grader', 'Fall 2021, Spring 2022', ''],
  ]],
  ['Daffodil International University, Bangladesh', 'Lecturer', 'Aug 2019 – Feb 2020', [
    ['', 'Electrical Circuit 1', 'Lecturer', 'Fall 2019', '35'],
    ['', 'Electronics II', 'Lecturer', 'Fall 2019', '26'],
    ['', 'Digital Electronics', 'Lecturer', 'Fall 2019, Spring 2020', '32, 30'],
    ['', 'Digital Signal Processing', 'Lecturer', 'Fall 2019, Spring 2020', '24'],
    ['', 'Continuous Signals and Linear Systems', 'Lecturer', 'Spring 2020', '37'],
    ['', 'Electromagnetic Fields and Waves', 'Lecturer', 'Spring 2020', '22'],
    ['', 'Electrical Circuit 1 Lab', 'Lab Instructor', 'Fall 2019', '35'],
    ['', 'Digital Electronics Lab', 'Lab Instructor', 'Fall 2019, Spring 2020', '24'],
  ]],
];

// Experience timeline, newest first: [title, place, period, detail]
const EXPERIENCE = [
  ['Assistant Professor', 'Department of Electrical and Computer Engineering, Grand Valley State University', 'Aug 2026 – present', ''],
  ['Postdoctoral Research Associate', 'Department of Electrical and Computer Engineering, Mississippi State University', 'Sep 2025 – Aug 2026', 'Signal processing, machine learning and sensor fusion for multimodal threat detection with radar, acoustic, LiDAR and camera systems. Supervised graduate and undergraduate researchers and led experimental data collection.'],
  ['Graduate Research Assistant', 'IMPRESS Lab, Mississippi State University', 'Aug 2022 – Aug 2025', 'Configured TI and INRAS radars for raw I/Q acquisition; built complex-valued learnable-filter networks, multimodal radar–LiDAR–video fusion, multi-target classification and high-resolution spectrogram reconstruction; collected RF waveforms with SDR transmit–receive pairs.'],
  ['Motion Sensors and Signal Processing Research Co-op', 'Bose Corporation, Framingham, MA', 'Jan – Jun 2024', 'Developed a machine learning algorithm for Bose Immersive Audio that aligns the IMU sensor frame with the head frame, and head-tracking algorithms for more reliable audio spatialization.'],
  ['MSU/USDA Graduate Summer Research Intern', 'High Performance Computing Center, Mississippi State University', 'May – Aug 2022', 'Designed and implemented an SDR-based L-band (1400–1427 MHz) radiometer in MATLAB and C/C++.'],
  ['Graduate Teaching Assistant', 'Department of Electrical and Computer Engineering, Mississippi State University', 'Aug 2021 – May 2025', 'Interim instructor for Signals and Systems; lab instructor for Advanced Electronic Circuits.'],
  ['Radio Service Specialist Engineer', 'Banglalink Digital Communications Ltd., Dhaka, Bangladesh', 'Mar 2020 – Jul 2021', 'Maintained network coverage and quality for the southwest zone of Bangladesh and contributed to network-wide 4G coverage upgrades.'],
  ['Lecturer', 'Department of Electrical Engineering, Daffodil International University, Bangladesh', 'Aug 2019 – Feb 2020', ''],
];

const EDUCATION = [
  ['Ph.D., Electrical and Computer Engineering', 'Mississippi State University', '2025', 'Dissertation: <i>Complex-Valued Parameterized Learnable Filters for Time-Frequency Domain Based Classification</i>. Major Professor: Dr. John E. Ball. Dissertation Director: Dr. Ali C. Gurbuz.'],
  ['B.Sc., Electrical and Electronic Engineering', 'Bangladesh University of Engineering and Technology (BUET)', '2019', 'Thesis: <i>Optimization of Electric Vehicle Charging to Shave Peak Load for Integration in Smart Grid</i>. Supervisor: Dr. Md. Forkan Uddin.'],
];

const HONORS = [
  ['Best Graduate Student, Bagley College of Engineering, Mississippi State University', '2024–25'],
  ['Best Graduate Researcher, Department of ECE, Mississippi State University', '2024–25'],
  ['Radar Challenge Finalist, 2024 IEEE Radar Conference (RadarConf24)', '2024'],
  ['Student Paper Competition Finalist, 2025 IEEE International Radar Conference, Atlanta', '2025'],
  ['2nd Runner-Up, 1st Multimodal Italian Sign Language Recognition Challenge, ICCV 2025', '2025'],
  ['Winner, Graduate Student Research Symposium, Mississippi State University', '2024'],
  ['2nd Runner-Up, Graduate Student Research Symposium, Mississippi State University', '2023'],
  ['Winner, Graduate Student Research Symposium, Mississippi State University', '2022'],
  ['Winner, ECE Graduate Student Research Symposium, Mississippi State University', '2022'],
  ['2nd Runner-Up, Battle Bot, Bangladesh University of Engineering and Technology (BUET)', '2017'],
  ['2nd Runner-Up, Line Following Robot (LFR), BUET RoboCarnival', '2017'],
  ['1st Runner-Up, NSU Tech Carnival, North South University', '2017'],
  ['1st Runner-Up, MIST Robolution, Military Institute of Science and Technology', '2017'],
  ['2nd Runner-Up, IUT Esonance, Islamic University of Technology', '2016'],
];

// Awards page: [title, body, year, detail, link?, photo?, caption?]
const AWARDS = [
  ['Best Graduate Student', 'James Worth Bagley College of Engineering, Mississippi State University', '2024–25', 'The college’s award for its top graduate student researcher of the year.', '', 'award-bcoe-2025.jpg', 'Receiving the Bagley College of Engineering Best Graduate Student award.'],
  ['Best Graduate Researcher', 'Department of Electrical and Computer Engineering, Mississippi State University', '2024–25', 'Presented at the department’s Distinguished Alumnus and Graduate Student Awards, Spring 2025.', '', 'award-ece-2025.jpg', 'Receiving the ECE Best Graduate Researcher award, Spring 2025.'],
  ['Student Paper Competition Finalist', '2025 IEEE International Radar Conference (RADAR), Atlanta, GA', '2025', 'For “Learnable Gaussian Filter-based Automatic RF Waveform Modulation Recognition.”', 'https://ieeexplore.ieee.org/document/11162602', 'award-radar2025.jpg', 'Recognized as a Student Paper Competition finalist at RADAR 2025.'],
  ['2nd Runner-Up', '1st Multimodal Italian Sign Language Recognition Challenge, ICCV 2025 workshops', '2025', 'With Sultan Mohammad Manjur, using fused video and radar data.', 'https://www.kaggle.com/competitions/iccv-mslr-2025-track-2', '', ''],
  ['Radar Challenge Finalist', '2024 IEEE Radar Conference (RadarConf24), Denver, CO', '2024', '', '', '', ''],
  ['Winner', 'Graduate Student Research Symposium, Mississippi State University', '2024', '', 'https://www.ece.msstate.edu/ece-students-win-mississippi-state-graduate-student-research-symposium-prizes/', 'award-grs2024.jpg', 'With the winner’s plaque, Graduate Research Symposium 2024.'],
  ['2nd Runner-Up', 'Graduate Student Research Symposium, Mississippi State University', '2023', '', 'https://www.ece.msstate.edu/ece-graduate-students-among-winners-in-fall-2023-graduate-student-research-symposium/', 'award-grs2023.jpg', 'At the poster, Graduate Research Symposium 2023.'],
  ['Winner', 'Graduate Student Research Symposium, Mississippi State University', '2022', '', 'https://www.msstate.edu/newsroom/article/2022/11/msu-recognizes-41-graduate-student-research-symposium-winners', 'award-grs2022.jpg', 'At the poster, Graduate Research Symposium 2022.'],
  ['Winner', 'ECE Graduate Student Research Symposium, Mississippi State University', '2022', '', 'https://www.ece.msstate.edu/ece-announces-its-fall-2022-research-symposium-awards/', '', ''],
  ['2nd Runner-Up, Battle Bot', 'Bangladesh University of Engineering and Technology (BUET), Dhaka', '2017', 'Robot combat competition.', '', '', ''],
  ['2nd Runner-Up, Line Following Robot (LFR)', 'BUET RoboCarnival, Bangladesh University of Engineering and Technology, Dhaka', '2017', '', '', '', ''],
  ['1st Runner-Up', 'NSU Tech Carnival, North South University, Dhaka', '2017', 'Robotics competition.', '', '', ''],
  ['1st Runner-Up', 'MIST Robolution, Military Institute of Science and Technology, Dhaka', '2017', 'Robotics competition.', '', '', ''],
  ['2nd Runner-Up, Line Following Robot (LFR)', 'IUT Esonance, Islamic University of Technology, Gazipur', '2016', 'The video shows my line-following robot on the Esonance 2016 track.', '', '', '', ['assets/research/lfr-iut-esonance-2016.mp4', 'assets/research/lfr-iut-esonance-2016.jpg', 'My line-following robot at IUT Esonance 2016.']],
];

// Talks and posters: [title, venue, date, format, photo?, photo caption?]
const TALKS = [
  ['Seminar', [
    ['HRSpecNET: A Deep Learning-Based High-Resolution Radar Micro-Doppler Signature Reconstruction for Improved HAR Classification', 'ECE Graduate Seminar, Mississippi State University', 'Fall 2024', 'Talk'],
  ]],
  ['Conference presentations', [
    ['Learnable Gaussian Filter-based Automatic RF Waveform Modulation Recognition', '2025 IEEE International Radar Conference (RADAR), Atlanta, GA', '2025', 'Poster · Student Paper Competition finalist', 'talk-radar2025.jpg', 'With the poster at the 2025 IEEE International Radar Conference, Atlanta.'],
    ['Deep Learning Based High-Resolution Frequency Estimation for Sparse Radar Range Profiles', '2024 IEEE Radar Conference (RadarConf24), Denver, CO', '2024', ''],
    ['Comparison Between Wi-Fi-CSI and Radar-Based HAR', '2024 IEEE Radar Conference (RadarConf24), Denver, CO', '2024', ''],
    ['Complex SincNet for More Interpretable Radar Based Activity Recognition', '2023 IEEE Radar Conference (RadarConf23), San Antonio, TX', '2023', 'Poster', 'talk-complexsincnet-radarconf23.jpg', 'Complex SincNet poster at RadarConf23, San Antonio.'],
    ['Classification of Traffic Signaling Motion in Automotive Applications Using FMCW Radar', '2023 IEEE Radar Conference (RadarConf23), San Antonio, TX', '2023', 'Poster', 'talk-traffic-radarconf23.jpg', 'Traffic signaling motion poster at RadarConf23, San Antonio.'],
    ['Design and Implementation of a Software Defined Radio-Based Radiometer Operating from a Small Unmanned Aircraft Systems', '2022 IEEE USNC-URSI Radio Science Meeting, Denver, CO', '2022', 'Poster', 'talk-radiometer-ursi.jpg', 'Presenting the SDR-based radiometer poster.'],
    ['Optimization of Electric Vehicle Charging to Shave Peak Load for Integration in Smart Grid', '2020 IEEE Region 10 Symposium (TENSYMP)', '2020', ''],
  ]],
  ['Research symposia', [
    ['HRSpecNET: Deep Learning-Based High-Resolution Time Frequency Analysis', 'Graduate Research Symposium, Mississippi State University', 'Fall 2024', 'Poster', 'talk-hrspecnet-symposium.jpg', 'HRSpecNet poster at the Mississippi State Graduate Research Symposium.'],
    ['CV-SincNet: Learning Complex Sinc Filters from Raw Radar Data for Computationally Efficient Human Motion Recognition', 'Graduate Research Symposium, Mississippi State University', 'Fall 2023', 'Poster', 'talk-cvsincnet-symposium.jpg', 'CV-SincNet poster at the Mississippi State Graduate Research Symposium.'],
    ['Boosting Multi-Target Recognition Performance with MIMO Radar-based Angular Subspace Projection and Multi-View DNN', 'Graduate Research Symposium, Mississippi State University', 'Fall 2022', ''],
    ['Angular Subspace Projection for Radar-based Multi-target Classification', 'ECE Graduate Research Symposium, Mississippi State University', 'Fall 2022', ''],
  ]],
];
const TALK_EXTRA_PHOTOS = [
  ['talk-radar2025-finalists.jpg', 'Recognized on stage with the Student Paper Competition finalists at the 2025 IEEE International Radar Conference.'],
];

const SERVICE = [
  ['Guest Editor, <i>Electronics</i> (MDPI)', 'Special Issue “<a href="https://www.mdpi.com/journal/electronics/special_issues/GQMHBJH3GU">Advanced Radar Sensing and Signal Processing for Intelligent Systems</a>”', '2026 – 2027'],
  ['Session Manager, IEEE VTC2026-Fall', 'Boston, MA. Track: Vehicular Cooperation, Communication, Radar, and Control', '2026'],
  ['Judge, Graduate Research Symposium', 'Mississippi State University', '2026'],
  ['Reviewer', 'IEEE Transactions on Aerospace and Electronic Systems, IEEE Transactions on Radar Systems, IEEE Transactions on Geoscience and Remote Sensing, IEEE JSTARS, IEEE Sensors Journal, IEEE Internet of Things Journal, Springer Nature journals, and the IEEE Radar Conference. <a href="https://www.webofscience.com/wos/author/record/JFA-3339-2023">Verified reviews</a>', 'Ongoing'],
];

const MEMBERSHIPS = ['IEEE', 'IEEE Aerospace and Electronic Systems Society', 'IEEE Signal Processing Society', 'IEEE Young Professionals'];

module.exports = { SITE, INTERESTS, GLANCE, BIO, THRUSTS, INSTRUMENTS, NEWS, PUBS, SELECTED, STUDENTS, ADVISING, TEACHING, EXPERIENCE, EDUCATION, HONORS, AWARDS, TALKS, TALK_EXTRA_PHOTOS, SERVICE, MEMBERSHIPS };
