import React from 'react';
import { RegionGroup } from './AnatomyPrimitives';

export default function BodyMapBack({ hits, maxHits, labels }) {
    return (
        <svg
            className="su-body-map-svg"
            viewBox="205 40 380 960"
            role="img"
            aria-label={labels?.back || 'Back body map'}
        >
            <g className="muscles">
                <RegionGroup id="Lats" hits={hits} maxHits={maxHits} label={labels?.Lats}>
                <path d="M310 285 L309 292 L311 308 L320 340 L333 363 L360 398 L363 398 L373 385 L381 370 L387 348 L386 324 L379 300 L370 283 L362 276 L349 285 L336 290 L323 290 Z" />
                <path d="M481 285 L467 290 L453 290 L442 286 L429 276 L424 279 L412 300 L404 329 L405 355 L417 383 L425 395 L430 399 L455 368 L472 337 L479 311 Z" />
                </RegionGroup>
                <RegionGroup id="Traps" hits={hits} maxHits={maxHits} label={labels?.Traps}>
                <path d="M369 151 L365 171 L358 178 L319 204 L316 208 L321 211 L339 215 L348 223 L388 310 L391 311 L393 300 L393 259 L391 233 L387 211 L390 163 L387 154 L382 151 L375 154 L370 161 L369 157 L371 153 Z" />
                <path d="M421 151 L419 153 L421 158 L420 160 L409 151 L405 152 L400 160 L400 183 L403 199 L403 214 L398 242 L398 306 L400 311 L402 311 L442 223 L454 214 L474 209 L473 206 L466 200 L434 180 L426 172 L423 166 Z" />
                </RegionGroup>
                <RegionGroup id="UpperBack" hits={hits} maxHits={maxHits} label={labels?.UpperBack}>
                <path d="M339 227 L334 227 L329 231 L318 247 L306 260 L304 265 L308 276 L315 282 L322 285 L332 286 L341 284 L350 279 L356 269 L356 258 L351 243 L346 234 Z" />
                <path d="M452 227 L445 233 L439 244 L434 260 L434 269 L438 277 L448 284 L456 286 L472 284 L480 279 L486 268 L486 263 L457 227 Z" />
                </RegionGroup>
                <RegionGroup id="MiddleBack" hits={hits} maxHits={maxHits} label={labels?.MiddleBack}>
                <path d="M390 360 L381 380 L367 403 L367 414 L373 427 L380 437 L389 444 L391 438 L392 366 Z" />
                <path d="M401 360 L399 363 L400 440 L403 444 L411 437 L418 427 L424 414 L424 404 Z" />
                </RegionGroup>
                <RegionGroup id="LowerBack" hits={hits} maxHits={maxHits} label={labels?.LowerBack}>
                <path d="M332 369 L333 385 L330 400 L332 427 L330 435 L346 425 L351 420 L356 409 L354 399 Z" />
                <path d="M460 369 L439 396 L435 409 L441 421 L461 435 L459 425 L461 411 L461 398 L459 390 Z" />
                </RegionGroup>
                <RegionGroup id="DeltoidPosterior" ids={["DeltoidPosterior","DeltoidLateral"]} hits={hits} maxHits={maxHits} label={[labels?.DeltoidPosterior, labels?.DeltoidLateral].filter(Boolean).join(' / ')}>
                <path d="M326 223 L314 219 L301 211 L290 212 L279 218 L268 230 L261 247 L260 273 L263 282 L270 279 L303 255 L322 233 Z" />
                <path d="M464 224 L468 233 L486 254 L526 283 L530 272 L529 248 L523 232 L513 220 L501 213 L490 211 L481 217 L470 220 Z" />
                </RegionGroup>
                <RegionGroup id="Triceps" hits={hits} maxHits={maxHits} label={labels?.Triceps}>
                <path d="M295 267 L277 278 L261 295 L255 307 L253 316 L252 359 L268 340 L283 307 L284 315 L278 334 L278 343 L286 365 L288 367 L299 343 L305 321 L304 294 L297 268 Z" />
                <path d="M494 268 L488 285 L485 309 L487 328 L498 359 L503 367 L509 355 L512 343 L512 333 L507 314 L508 308 L520 336 L530 350 L539 359 L538 321 L534 303 L528 293 L515 280 L501 270 Z" />
                <path d="M272 344 L259 358 L254 369 L254 383 L260 398 L266 397 L276 387 L281 376 L280 361 Z" />
                <path d="M518 344 L511 359 L509 376 L515 388 L528 399 L531 397 L535 388 L537 371 L531 357 Z" />
                </RegionGroup>
                <RegionGroup id="Forearms" hits={hits} maxHits={maxHits} label={labels?.Forearms}>
                <path d="M247 371 L243 376 L235 394 L231 412 L231 463 L229 474 L229 491 L232 486 L238 460 L250 431 L255 410 L254 396 Z" />
                <path d="M543 370 L535 403 L536 415 L554 467 L558 487 L561 491 L559 409 L553 388 Z" />
                <path d="M288 376 L280 389 L265 405 L259 417 L241 468 L238 482 L238 494 L241 493 L249 475 L254 468 L255 471 L247 491 L247 496 L249 495 L260 469 L273 449 L281 432 L287 408 Z" />
                <path d="M503 377 L504 411 L511 437 L531 471 L541 495 L543 496 L543 491 L537 476 L537 469 L549 493 L551 494 L551 476 L536 428 L526 407 L512 391 Z" />
                </RegionGroup>
                <RegionGroup id="Glutes" hits={hits} maxHits={maxHits} label={labels?.Glutes}>
                <path d="M347 431 L339 435 L332 442 L323 458 L318 475 L318 499 L322 514 L331 528 L343 535 L359 536 L377 528 L388 516 L394 498 L394 481 L388 460 L377 443 L364 433 L359 431 Z" />
                <path d="M432 431 L419 438 L407 453 L398 476 L397 500 L402 515 L414 528 L429 535 L446 536 L458 530 L468 516 L473 499 L473 474 L469 459 L461 444 L452 435 L446 432 Z" />
                </RegionGroup>
                <RegionGroup id="Hamstrings" hits={hits} maxHits={maxHits} label={labels?.Hamstrings}>
                <path d="M315 506 L310 521 L305 561 L307 593 L314 628 L317 578 L324 552 L331 537 L322 524 Z" />
                <path d="M476 506 L474 514 L468 526 L461 534 L460 539 L468 555 L474 579 L477 627 L483 600 L486 563 L479 511 Z" />
                <path d="M395 518 L394 572 L387 628 L394 564 L396 563 L405 639 L397 574 L397 519 Z" />
                <path d="M389 523 L375 534 L356 541 L357 550 L367 582 L381 639 L390 569 Z" />
                <path d="M401 522 L401 572 L410 638 L421 592 L434 550 L435 541 L416 534 Z" />
                <path d="M346 541 L338 544 L333 549 L326 564 L322 579 L318 615 L320 649 L326 670 L331 680 L336 684 L340 677 L346 645 L348 642 L357 671 L362 681 L368 684 L374 679 L378 670 L378 646 L351 542 Z" />
                <path d="M450 542 L440 542 L415 635 L412 667 L416 678 L423 684 L427 683 L432 675 L443 642 L445 645 L450 674 L454 684 L459 681 L465 670 L471 649 L472 602 L470 585 L463 559 L457 548 Z" />
                </RegionGroup>
                <RegionGroup id="Calves" hits={hits} maxHits={maxHits} label={labels?.Calves}>
                <path d="M337 706 L330 717 L325 734 L321 758 L321 784 L324 797 L331 814 L339 823 L344 824 L348 821 L351 815 L354 803 L354 766 L346 721 L341 709 Z" />
                <path d="M365 707 L362 709 L358 717 L355 730 L356 770 L364 810 L372 824 L377 824 L384 807 L387 775 L376 730 L368 708 Z" />
                <path d="M427 707 L424 707 L421 712 L408 754 L404 774 L404 789 L407 808 L412 822 L416 825 L420 823 L427 809 L435 769 L436 732 L433 717 Z" />
                <path d="M455 707 L451 708 L444 725 L437 767 L437 803 L440 815 L443 821 L447 824 L454 822 L460 814 L465 803 L470 784 L470 758 L468 744 L461 717 Z" />
                <path d="M333 823 L354 909 L357 912 L359 908 L359 894 L351 848 L345 830 L339 828 Z" />
                <path d="M365 822 L362 837 L364 868 L371 906 L375 911 L374 869 L377 833 L367 822 Z" />
                <path d="M426 822 L415 830 L414 833 L417 871 L416 911 L420 905 L427 868 L429 836 Z" />
                <path d="M458 823 L452 828 L446 830 L441 844 L433 887 L433 911 L436 910 Z" />
                </RegionGroup>
            </g>
        </svg>
    );
}
